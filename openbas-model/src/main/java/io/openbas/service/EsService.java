package io.openbas.service;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch.core.BulkRequest;
import co.elastic.clients.elasticsearch.core.BulkResponse;
import co.elastic.clients.elasticsearch.core.bulk.BulkResponseItem;
import io.openbas.database.model.IndexingStatus;
import io.openbas.database.repository.IndexingStatusRepository;
import io.openbas.engine.EsEngine;
import io.openbas.engine.EsModel;
import io.openbas.engine.handler.Handler;
import io.openbas.engine.model.EsBase;

import java.io.IOException;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class EsService {

    private EsEngine esEngine;
    private ElasticsearchClient elasticClient;
    private IndexingStatusRepository indexingStatusRepository;

    @Autowired
    public void setEsEngine(EsEngine esEngine) {
        this.esEngine = esEngine;
    }

    @Autowired
    public void setElasticClient(ElasticsearchClient elasticClient) {
        this.elasticClient = elasticClient;
    }

    @Autowired
    public void setIndexingStatusRepository(IndexingStatusRepository indexingStatusRepository) {
        this.indexingStatusRepository = indexingStatusRepository;
    }

    public void bulkParallelProcessing() {
        List<EsModel<?>> models = this.esEngine.getModels();
        System.out.println("Executing bulk parallel processing for " + models.size() + " models");
        models.stream().parallel().forEach(model -> {
            Optional<IndexingStatus> indexingStatus = indexingStatusRepository.findByType(model.getName());
            Handler<? extends EsBase> handler = model.getHandler();
            String index = model.getIndex();
            Instant fetchInstant = indexingStatus.map(IndexingStatus::getLastIndexing).orElse(null);
            List<? extends EsBase> results = handler.fetch(fetchInstant);
            if (!results.isEmpty()) {
                // Create bulk for the data
                BulkRequest.Builder br = new BulkRequest.Builder();
                for (EsBase result : results) {
                    br.operations(op -> op.index(idx ->
                            idx.index(index).id(result.getId()).document(result)));
                }
                // Execute the bulk
                try {
                    System.out.println("Executing " + results.size() + " in bulk request for " + model.getName());
                    BulkRequest bulkRequest = br.build();
                    BulkResponse result = elasticClient.bulk(bulkRequest);
                    // Log errors, if any
                    if (result.errors()) {
                        for (BulkResponseItem item : result.items()) {
                            if (item.error() != null) {
                                System.out.println(item.error().reason());
                            }
                        }
                    } else {
                        // Update the status for the next round
                        if (indexingStatus.isPresent()) {
                            IndexingStatus status = indexingStatus.get();
                            status.setLastIndexing(results.getLast().getUpdated_at());
                            indexingStatusRepository.save(status);
                        } else {
                            IndexingStatus status = new IndexingStatus();
                            status.setType(model.getName());
                            status.setLastIndexing(results.getLast().getUpdated_at());
                            indexingStatusRepository.save(status);
                        }

                    }
                } catch (IOException e) {
                    System.out.println("ElasticSyncExecutionJob exception: " + e);
                }
            }
        });
    }
}
