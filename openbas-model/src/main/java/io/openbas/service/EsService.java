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
import io.openbas.database.model.Filters;
import io.openbas.database.model.IndexingStatus;
import io.openbas.database.raw.RawUserAuth;
import io.openbas.database.repository.IndexingStatusRepository;
import io.openbas.engine.EsEngine;
import io.openbas.engine.EsModel;
import io.openbas.engine.Handler;
import io.openbas.engine.api.DateHistogramConfig;
import io.openbas.engine.api.DateHistogramRuntime;
import io.openbas.engine.api.StructuralHistogramConfig;
import io.openbas.engine.api.StructuralHistogramRuntime;
import io.openbas.engine.model.*;
import io.openbas.engine.query.EsStructuralSeries;
import io.openbas.engine.query.EsStructuralSeriesData;
import io.openbas.engine.query.EsTimeseries;
import io.openbas.engine.query.EsTimeseriesData;
import io.openbas.schema.PropertySchema;
import io.openbas.schema.SchemaUtils;
import java.io.IOException;
import java.time.Instant;
import java.util.*;
import java.util.logging.Logger;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class EsService {

  private static final Logger LOGGER = Logger.getLogger(EsService.class.getName());
  private final List<String> BASE_FIELDS = List.of("base_id", "base_entity", "base_representative");

  private EsEngine esEngine;
  private ElasticsearchClient elasticClient;
  private IndexingStatusRepository indexingStatusRepository;
  private EngineConfig engineConfig;

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

  // TODO ADD IN CONSTRUCTOR OR CACHE
  private Map<String, PropertySchema> getIndexingSchema() {
    Set<PropertySchema> properties =
        esEngine.getModels().stream()
            .flatMap(
                model -> {
                  try {
                    return SchemaUtils.schemaWithSubtypes(model.getModel()).stream();
                  } catch (ClassNotFoundException e) {
                    throw new RuntimeException(e);
                  }
                })
            .filter(PropertySchema::isFilterable)
            .collect(Collectors.toSet());
    return properties.stream().collect(Collectors.toMap(PropertySchema::getName, prop -> prop));
  }

  private FieldValue toVal(String field, String value, Map<String, String> parameters) {
    FieldValue.Builder builder = new FieldValue.Builder();
    String target = parameters.getOrDefault(value, value);
    PropertySchema propertyField = getIndexingSchema().get(field);
    if (propertyField == null) {
      throw new RuntimeException("Unknown field: " + field);
    }
    if (propertyField.getType().isAssignableFrom(String.class)) {
      builder.stringValue(target);
    } else if (propertyField.getType().isAssignableFrom(Number.class)) {
      builder.longValue(Long.parseLong(target));
    } else if (propertyField.getType().isAssignableFrom(Boolean.class)) {
      builder.booleanValue(Boolean.parseBoolean(target));
    } else {
      throw new RuntimeException("Unsupported field type: " + propertyField.getType());
    }
    return builder.build();
  }

  // region utils
  private Query queryFromBaseFilter(Filters.Filter filter, Map<String, String> parameters) {
    Filters.FilterOperator operator = filter.getOperator();
    BoolQuery.Builder boolQuery = new BoolQuery.Builder();
    Filters.FilterMode filterMode = filter.getMode();
    String field = filter.getKey();
    // TODO MUST BE PART OF QUERYABLE IN THE SCHEMA
    String elasticField =
        field.endsWith("_id") || field.endsWith("_side") ? (field + ".keyword") : field;
    switch (operator) {
      case eq:
        List<Query> queryList =
            filter.getValues().stream()
                .map(
                    v ->
                        TermQuery.of(t -> t.field(elasticField).value(toVal(field, v, parameters)))
                            ._toQuery())
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
                .map(
                    v ->
                        TermQuery.of(t -> t.field(elasticField).value(toVal(field, v, parameters)))
                            ._toQuery())
                .toList();
        boolQuery.mustNot(queryNotList);
        break;
      default:
        throw new UnsupportedOperationException("Filter operator " + operator + " not supported");
    }
    return boolQuery.build()._toQuery();
  }

  private Query buildQueryRestrictions(RawUserAuth user) {
    // If user is admin, no need to check the ACL
    if (user.getUser_admin()) {
      return null;
    }
    Set<String> scenarioIds = user.getUser_grant_scenarios();
    Set<String> exerciseIds = user.getUser_grant_exercises();
    List<String> restrictions = Stream.concat(exerciseIds.stream(), scenarioIds.stream()).toList();
    List<FieldValue> values = restrictions.stream().map(FieldValue::of).toList();
    BoolQuery.Builder authQuery = new BoolQuery.Builder();
    Query compliantField =
        TermsQuery.of(
                t ->
                    t.field("base_restrictions.keyword")
                        .terms(TermsQueryField.of(tq -> tq.value(values))))
            ._toQuery();
    BoolQuery.Builder emptyRestrictBuilder = new BoolQuery.Builder();
    Query existField = ExistsQuery.of(b -> b.field("base_restrictions.keyword"))._toQuery();
    Query emptyRestrictQuery = emptyRestrictBuilder.mustNot(existField).build()._toQuery();
    return authQuery.should(compliantField, emptyRestrictQuery).build()._toQuery();
  }

  private Query queryFromSearch(String search) {
    BoolQuery.Builder mainQuery = new BoolQuery.Builder();
    QueryStringQuery.Builder queryStringQuery = new QueryStringQuery.Builder();
    queryStringQuery.query(search).analyzeWildcard(true).fields(BASE_FIELDS);
    return queryStringQuery.build()._toQuery();
  }

  private Query queryFromFilter(Filters.FilterGroup groupFilter, Map<String, String> parameters) {
    Filters.FilterMode filterMode = groupFilter.getMode();
    BoolQuery.Builder filterQuery = new BoolQuery.Builder();
    List<Query> filterQueries = new ArrayList<>();
    List<Filters.Filter> filters = groupFilter.getFilters();
    filters.forEach(f -> filterQueries.add(queryFromBaseFilter(f, parameters)));
    if (filterMode == Filters.FilterMode.and) {
      filterQuery.must(filterQueries);
    } else {
      filterQuery.should(filterQueries);
      filterQuery.minimumShouldMatch("1");
    }
    return filterQuery.build()._toQuery();
  }

  private Query buildQuery(
      RawUserAuth user,
      String search,
      Filters.FilterGroup groupFilter,
      Map<String, String> parameters) {
    BoolQuery.Builder mainQuery = new BoolQuery.Builder();
    List<Query> mainMust = new ArrayList<>();
    Query restrictionQuery = buildQueryRestrictions(user);
    if (restrictionQuery != null) {
      mainMust.add(restrictionQuery);
    }
    BoolQuery.Builder dataQueryBuilder = new BoolQuery.Builder();
    List<Query> shouldList = new ArrayList<>();
    if (search != null) {
      Query searchQuery = queryFromSearch(search);
      shouldList.add(searchQuery);
    }
    if (groupFilter.getFilters() != null) {
      Query filterQuery = queryFromFilter(groupFilter, parameters);
      shouldList.add(filterQuery);
    }
    if (shouldList.isEmpty()) {
      throw new IllegalArgumentException("One of search or filter must not be null");
    }
    Query dataQuery =
        dataQueryBuilder.should(shouldList).minimumShouldMatch("1").build()._toQuery();
    mainMust.add(dataQuery);
    return mainQuery.must(mainMust).build()._toQuery();
  }

  private Map<String, String> resolveIdsRepresentative(RawUserAuth user, List<String> ids) {
    Filters.FilterGroup filterGroup = new Filters.FilterGroup();
    Filters.Filter filter = new Filters.Filter();
    filter.setKey("base_id");
    filter.setOperator(Filters.FilterOperator.eq);
    filter.setValues(ids);
    filterGroup.setFilters(List.of(filter));
    Query query = buildQuery(user, null, filterGroup, new HashMap<>());
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

  // endregion

  // region indexing
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
                  t -> t.field("base_id.keyword").terms(TermsQueryField.of(tq -> tq.value(values))))
              ._toQuery();
      Query dependenciesId =
          TermsQuery.of(
                  t ->
                      t.field("base_dependencies.keyword")
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

  // endregion

  // region query
  public EsStructuralSeries termHistogram(RawUserAuth user, StructuralHistogramRuntime runtime) {
    StructuralHistogramConfig config = runtime.getConfig();
    Query query = buildQuery(user, null, config.getFilter(), runtime.getParameters());
    String aggregationKey = "term_histogram";
    try {
      String field = runtime.getParameters().getOrDefault(config.getField(), config.getField());
      TermsAggregation termsAggregation =
          new TermsAggregation.Builder().field(field + ".keyword").size(100).build();
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
      boolean isSideAggregation = field.endsWith("_side");
      Map<String, String> resolutions = new HashMap<>();
      if (isSideAggregation) {
        List<String> ids = buckets.array().stream().map(s -> s.key().stringValue()).toList();
        resolutions.putAll(resolveIdsRepresentative(user, ids));
      }
      List<EsStructuralSeriesData> data =
          buckets.array().stream()
              .map(
                  b -> {
                    String key = b.key().stringValue();
                    String label = isSideAggregation ? resolutions.get(key) : key;
                    String seriesKey = label != null ? label : "deleted";
                    return new EsStructuralSeriesData(seriesKey, b.docCount());
                  })
              .toList();
      return new EsStructuralSeries(config.getName(), data);
    } catch (Exception e) {
      LOGGER.severe("termHistogram exception: " + e);
    }
    return new EsStructuralSeries(config.getName());
  }

  public List<EsStructuralSeries> multiTermHistogram(
      RawUserAuth user, List<StructuralHistogramRuntime> runtimes) {
    return runtimes.stream().parallel().map(r -> termHistogram(user, r)).toList();
  }

  public EsTimeseries dateHistogram(RawUserAuth user, DateHistogramRuntime runtime) {
    DateHistogramConfig config = runtime.getConfig();
    BoolQuery.Builder queryBuilder = new BoolQuery.Builder();
    String start = runtime.getParameters().getOrDefault(config.getStart(), config.getStart());
    Instant startInstant = Instant.parse(start);
    String end = runtime.getParameters().getOrDefault(config.getEnd(), config.getEnd());
    Instant endInstant = Instant.parse(end);
    Query dateRangeQuery =
        DateRangeQuery.of(d -> d.field(config.getField()).gt(start).lt(end))
            ._toRangeQuery()
            ._toQuery();
    Query filterQuery = buildQuery(user, null, config.getFilter(), runtime.getParameters());
    Query query = queryBuilder.must(dateRangeQuery, filterQuery).build()._toQuery();
    ExtendedBounds.Builder<FieldDateMath> bounds = new ExtendedBounds.Builder<>();
    bounds.min(FieldDateMath.of(m -> m.value((double) startInstant.toEpochMilli())));
    bounds.max(FieldDateMath.of(m -> m.value((double) endInstant.toEpochMilli())));
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
      List<EsTimeseriesData> data =
          buckets.array().stream()
              .map(b -> new EsTimeseriesData(Instant.ofEpochMilli(b.key()), b.docCount()))
              .toList();
      return new EsTimeseries(config.getName(), data);
    } catch (IOException e) {
      LOGGER.severe("dateHistogram exception: " + e);
    }
    return new EsTimeseries(config.getName());
  }

  public List<EsTimeseries> multiDateHistogram(
      RawUserAuth user, List<DateHistogramRuntime> runtimes) {
    return runtimes.stream().parallel().map(r -> dateHistogram(user, r)).toList();
  }

  public List<EsSearch> search(RawUserAuth user, String search, Filters.FilterGroup filter) {
    Query query = buildQuery(user, search, filter, new HashMap<>());
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
  // endregion
}
