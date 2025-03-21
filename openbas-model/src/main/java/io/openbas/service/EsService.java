package io.openbas.service;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.FieldValue;
import co.elastic.clients.elasticsearch._types.aggregations.Buckets;
import co.elastic.clients.elasticsearch._types.aggregations.DateHistogramBucket;
import co.elastic.clients.elasticsearch._types.aggregations.ExtendedBounds;
import co.elastic.clients.elasticsearch._types.aggregations.FieldDateMath;
import co.elastic.clients.elasticsearch._types.query_dsl.*;
import co.elastic.clients.elasticsearch.core.BulkRequest;
import co.elastic.clients.elasticsearch.core.BulkResponse;
import co.elastic.clients.elasticsearch.core.DeleteByQueryRequest;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import co.elastic.clients.elasticsearch.core.bulk.BulkResponseItem;
import io.openbas.database.model.Filters;
import io.openbas.database.model.IndexingStatus;
import io.openbas.database.repository.IndexingStatusRepository;
import io.openbas.engine.EsEngine;
import io.openbas.engine.EsModel;
import io.openbas.engine.EsTimeseries;
import io.openbas.engine.api.DateHistogramConfig;
import io.openbas.engine.handler.Handler;
import io.openbas.engine.model.EsBase;
import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
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
    models.stream()
        .parallel()
        .forEach(
            model -> {
              Optional<IndexingStatus> indexingStatus =
                  indexingStatusRepository.findByType(model.getName());
              Handler<? extends EsBase> handler = model.getHandler();
              String index = model.getIndex();
              Instant fetchInstant =
                  indexingStatus.map(IndexingStatus::getLastIndexing).orElse(null);
              List<? extends EsBase> results = handler.fetch(fetchInstant);
              if (!results.isEmpty()) {
                // Create bulk for the data
                BulkRequest.Builder br = new BulkRequest.Builder();
                for (EsBase result : results) {
                  br.operations(
                      op -> op.index(idx -> idx.index(index).id(result.getId()).document(result)));
                }
                // Execute the bulk
                try {
                  System.out.println(
                      "Executing " + results.size() + " in bulk request for " + model.getName());
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

  public void bulkDelete(List<String> ids) {
    try {
      List<FieldValue> values = ids.stream().map(FieldValue::of).toList();
      Query directId =
          TermsQuery.of(
                  t -> t.field("id.keyword").terms(TermsQueryField.of(tq -> tq.value(values))))
              ._toQuery();
      ;
      Query dependenciesId =
          TermsQuery.of(
                  t ->
                      t.field("dependencies.keyword")
                          .terms(TermsQueryField.of(tq -> tq.value(values))))
              ._toQuery();
      ;
      Query query =
          BoolQuery.of(b -> b.should(directId, dependenciesId).minimumShouldMatch("1"))._toQuery();
      elasticClient.deleteByQuery(
          new DeleteByQueryRequest.Builder().index("openbas_*").query(query).build());
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
  }

  public Query queryFromFilter(Filters.Filter filter) {
    Filters.FilterOperator operator = filter.getOperator();
    BoolQuery.Builder boolQuery = new BoolQuery.Builder();
    Filters.FilterMode filterMode = filter.getMode();
    String field = filter.getKey();
    switch (operator) {
      case eq:
        List<Query> queryList =
            filter.getValues().stream()
                .map(v -> TermQuery.of(t -> t.field(field).value(v))._toQuery())
                .toList();
        if (filterMode == Filters.FilterMode.and) {
          boolQuery.must(queryList);
        } else {
          boolQuery.should(queryList).minimumShouldMatch("1");
        }
        break;
      case not_eq:
        List<Query> queryNotList =
            filter.getValues().stream()
                .map(v -> TermQuery.of(t -> t.field(field).value(v))._toQuery())
                .toList();
        boolQuery.mustNot(queryNotList);
        break;
      default:
        throw new UnsupportedOperationException("Filter operator " + operator + " not supported");
    }
    return boolQuery.build()._toQuery();
  }

  public Query queryFromFilterGroup(Filters.FilterGroup filter) {
    Filters.FilterMode filterMode = filter.getMode();
    BoolQuery.Builder boolQuery = new BoolQuery.Builder();
    List<Query> filterQueries = new ArrayList<>();
    List<Filters.Filter> filters = filter.getFilters();
    filters.forEach(f -> filterQueries.add(queryFromFilter(f)));
    if (filterMode == Filters.FilterMode.and) {
      boolQuery.must(filterQueries);
    } else {
      boolQuery.should(filterQueries);
      boolQuery.minimumShouldMatch("1");
    }
    return boolQuery.build()._toQuery();
  }

  // Timeseries { date, value }
  public List<EsTimeseries> dateHistogram(DateHistogramConfig config) {
    BoolQuery.Builder queryBuilder = new BoolQuery.Builder();
    Query dateRangeQuery =
        DateRangeQuery.of(
                d ->
                    d.field(config.getField())
                        .gt(config.getStart().toString())
                        .lt(config.getEnd().toString()))
            ._toRangeQuery()
            ._toQuery();
    Query filterQuery = queryFromFilterGroup(config.getFilter());
    Query query = queryBuilder.must(dateRangeQuery, filterQuery).build()._toQuery();
    ExtendedBounds.Builder<FieldDateMath> bounds = new ExtendedBounds.Builder<>();
    bounds.min(FieldDateMath.of(m -> m.value((double) config.getStart().toEpochMilli())));
    bounds.max(FieldDateMath.of(m -> m.value((double) config.getEnd().toEpochMilli())));
    ExtendedBounds<FieldDateMath> extendedBounds = bounds.build();
    try {
      String aggregationKey = "date_histogram";
      SearchResponse<Void> response =
          elasticClient.search(
              b ->
                  b.index("openbas_*")
                      .size(0)
                      .query(query)
                      .aggregations(
                          aggregationKey,
                          a ->
                              a.dateHistogram(
                                  h ->
                                      h.field(config.getField())
                                          .minDocCount(0)
                                          .format(config.getInterval().format)
                                          .calendarInterval(config.getInterval().type)
                                          .extendedBounds(extendedBounds)
                                          .keyed(false))),
              Void.class);
      Buckets<DateHistogramBucket> buckets =
          response.aggregations().get(aggregationKey).dateHistogram().buckets();
      return buckets.array().stream()
          .map(b -> new EsTimeseries(Instant.ofEpochMilli(b.key()), b.docCount()))
          .toList();
    } catch (IOException e) {
      System.out.println("ElasticSyncExecutionJob exception: " + e);
    }
    return List.of();
  }
}
