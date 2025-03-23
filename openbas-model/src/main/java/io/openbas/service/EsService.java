package io.openbas.service;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.FieldSort;
import co.elastic.clients.elasticsearch._types.FieldValue;
import co.elastic.clients.elasticsearch._types.SortOptions;
import co.elastic.clients.elasticsearch._types.SortOrder;
import co.elastic.clients.elasticsearch._types.aggregations.*;
import co.elastic.clients.elasticsearch._types.query_dsl.*;
import co.elastic.clients.elasticsearch.core.BulkRequest;
import co.elastic.clients.elasticsearch.core.BulkResponse;
import co.elastic.clients.elasticsearch.core.DeleteByQueryRequest;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import co.elastic.clients.elasticsearch.core.bulk.BulkResponseItem;
import co.elastic.clients.elasticsearch.core.search.Hit;
import io.openbas.config.EngineConfig;
import io.openbas.config.S3Config;
import io.openbas.database.model.Filters;
import io.openbas.database.model.IndexingStatus;
import io.openbas.database.repository.IndexingStatusRepository;
import io.openbas.engine.EsEngine;
import io.openbas.engine.EsModel;
import io.openbas.engine.api.DateHistogramConfig;
import io.openbas.engine.api.StructuralHistogramConfig;
import io.openbas.engine.handler.Handler;
import io.openbas.engine.model.EsBase;
import io.openbas.engine.model.EsSearch;
import io.openbas.engine.model.EsStructuralSeries;
import io.openbas.engine.model.EsTimeseries;
import java.io.IOException;
import java.time.Instant;
import java.util.*;
import java.util.logging.Logger;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class EsService {

  private static final Logger LOGGER = Logger.getLogger(EsService.class.getName());
  private final List<String> BASE_FIELDS =
      List.of("base_id", "base_entity", "base_representative", "finding_value");

  private EsEngine esEngine;
  private ElasticsearchClient elasticClient;
  private IndexingStatusRepository indexingStatusRepository;
  private EngineConfig engineConfig;
  private S3Config s3Config;

  @Autowired
  public void setEngineConfig(EngineConfig engineConfig) {
    this.engineConfig = engineConfig;
  }

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
    LOGGER.info("Executing bulk parallel processing for " + models.size() + " models");
    models.stream()
        .parallel()
        .forEach(
            model -> {
              Optional<IndexingStatus> indexingStatus =
                  indexingStatusRepository.findByType(model.getName());
              Handler<? extends EsBase> handler = model.getHandler();
              String index = model.getIndex(engineConfig);
              Instant fetchInstant =
                  indexingStatus.map(IndexingStatus::getLastIndexing).orElse(null);
              List<? extends EsBase> results = handler.fetch(fetchInstant);
              if (!results.isEmpty()) {
                // Create bulk for the data
                BulkRequest.Builder br = new BulkRequest.Builder();
                for (EsBase result : results) {
                  br.operations(
                      op ->
                          op.index(
                              idx -> idx.index(index).id(result.getBase_id()).document(result)));
                }
                // Execute the bulk
                try {
                  LOGGER.info(
                      "Indexing (" + results.size() + ") in progress for " + model.getName());
                  BulkRequest bulkRequest = br.build();
                  BulkResponse result = elasticClient.bulk(bulkRequest);
                  // Log errors, if any
                  if (result.errors()) {
                    for (BulkResponseItem item : result.items()) {
                      if (item.error() != null) {
                        LOGGER.severe(item.error().reason());
                      }
                    }
                  } else {
                    // Update the status for the next round
                    if (indexingStatus.isPresent()) {
                      IndexingStatus status = indexingStatus.get();
                      status.setLastIndexing(results.getLast().getBase_updated_at());
                      indexingStatusRepository.save(status);
                    } else {
                      IndexingStatus status = new IndexingStatus();
                      status.setType(model.getName());
                      status.setLastIndexing(results.getLast().getBase_updated_at());
                      indexingStatusRepository.save(status);
                    }
                  }
                } catch (IOException e) {
                  LOGGER.severe("bulkParallelProcessing exception: " + e);
                }
              } else {
                LOGGER.info("Indexing <up to date> for " + model.getName());
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
      Query dependenciesId =
          TermsQuery.of(
                  t ->
                      t.field("dependencies.keyword")
                          .terms(TermsQueryField.of(tq -> tq.value(values))))
              ._toQuery();
      Query query =
          BoolQuery.of(b -> b.should(directId, dependenciesId).minimumShouldMatch("1"))._toQuery();
      elasticClient.deleteByQuery(
          new DeleteByQueryRequest.Builder()
              .index(engineConfig.getIndexPrefix() + "*")
              .query(query)
              .build());
    } catch (IOException e) {
      LOGGER.severe("bulkDelete exception: " + e);
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

  public Query queryFromFilterGroup(String search, Filters.FilterGroup groupFilter) {
    Query filteringQuery = null;
    // Handle filter generation
    if (groupFilter != null) {
      Filters.FilterMode filterMode = groupFilter.getMode();
      BoolQuery.Builder filterQuery = new BoolQuery.Builder();
      List<Query> filterQueries = new ArrayList<>();
      List<Filters.Filter> filters = groupFilter.getFilters();
      filters.forEach(f -> filterQueries.add(queryFromFilter(f)));
      if (filterMode == Filters.FilterMode.and) {
        filterQuery.must(filterQueries);
      } else {
        filterQuery.should(filterQueries);
        filterQuery.minimumShouldMatch("1");
      }
      filteringQuery = filterQuery.build()._toQuery();
      if (search == null) {
        return filteringQuery;
      }
    }
    // Handle search generation
    if (search != null) {
      // Add search parameter if needed
      BoolQuery.Builder mainQuery = new BoolQuery.Builder();
      QueryStringQuery.Builder queryStringQuery = new QueryStringQuery.Builder();
      queryStringQuery.query(search).analyzeWildcard(true).fields(BASE_FIELDS);
      Query searchQuery = queryStringQuery.build()._toQuery();
      if (filteringQuery != null) {
        mainQuery.must(List.of(filteringQuery, searchQuery));
        return mainQuery.build()._toQuery();
      }
      return searchQuery;
    }
    // No parameter
    throw new IllegalArgumentException("One of search or filter must not be null");
  }

  public Map<String, String> resolveIdsRepresentative(List<String> ids) {
    List<FieldValue> values = ids.stream().map(FieldValue::of).toList();
    Query query =
        TermsQuery.of(t -> t.field("id.keyword").terms(TermsQueryField.of(tq -> tq.value(values))))
            ._toQuery();
    try {
      SearchResponse<EsBase> response =
          elasticClient.search(
              b -> b.index(engineConfig.getIndexPrefix() + "*").query(query), EsBase.class);
      List<Hit<EsBase>> hits = response.hits().hits();
      return hits.stream()
          .map(Hit::source)
          .collect(Collectors.toMap(EsBase::getBase_id, EsBase::getBase_representative));
    } catch (Exception e) {
      LOGGER.severe("resolveIdsRepresentative exception: " + e);
    }
    return Map.of();
  }

  public List<EsStructuralSeries> termHistogram(StructuralHistogramConfig config) {
    Query query = queryFromFilterGroup(null, config.getFilter());
    String aggregationKey = "term_histogram";
    try {
      TermsAggregation termsAggregation =
          new TermsAggregation.Builder().field(config.getField() + ".keyword").size(100).build();
      SearchResponse<Void> response =
          elasticClient.search(
              b ->
                  b.index(engineConfig.getIndexPrefix() + "*")
                      .size(0)
                      .query(query)
                      .aggregations(
                          aggregationKey,
                          new Aggregation.Builder().terms(termsAggregation).build()),
              Void.class);
      Buckets<StringTermsBucket> buckets =
          response.aggregations().get(aggregationKey).sterms().buckets();
      boolean isSideAggregation = config.getField().endsWith("_side");
      Map<String, String> resolutions = new HashMap<>();
      if (isSideAggregation) {
        List<String> ids = buckets.array().stream().map(s -> s.key().stringValue()).toList();
        resolutions.putAll(resolveIdsRepresentative(ids));
      }
      return buckets.array().stream()
          .map(
              b -> {
                String key = b.key().stringValue();
                String label = isSideAggregation ? resolutions.get(key) : key;
                String seriesKey = label != null ? label : "deleted";
                return new EsStructuralSeries(seriesKey, b.docCount());
              })
          .toList();
    } catch (Exception e) {
      LOGGER.severe("termHistogram exception: " + e);
    }
    return List.of();
  }

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
    Query filterQuery = queryFromFilterGroup(null, config.getFilter());
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
                  b.index(engineConfig.getIndexPrefix() + "*")
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
      LOGGER.severe("dateHistogram exception: " + e);
    }
    return List.of();
  }

  public List<EsSearch> search(String search, Filters.FilterGroup filter) {
    Query query = queryFromFilterGroup(search, filter);
    try {
      SearchResponse<EsSearch> response =
          elasticClient.search(
              b ->
                  b.index(engineConfig.getIndexPrefix() + "*")
                      .size(engineConfig.getDefaultPagination())
                      .query(query)
                      .sort(
                          SortOptions.of(
                              s ->
                                  s.field(
                                      FieldSort.of(f -> f.field("_score").order(SortOrder.Desc))))),
              EsSearch.class);
      return response.hits().hits().stream()
          .filter(hit -> hit.source() != null)
          .map(
              hit -> {
                EsSearch source = hit.source();
                source.setScore(hit.score());
                return source;
              })
          .toList();
    } catch (IOException e) {
      LOGGER.severe("query exception: " + e);
    }
    return List.of();
  }
}
