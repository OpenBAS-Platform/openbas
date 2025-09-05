package io.openbas.service;

import static io.openbas.utils.CustomDashboardQueryUtils.*;
import static io.openbas.utils.ElasticUtils.*;
import static io.openbas.utils.ElasticUtils.buildDateRangeQuery;
import static java.util.Optional.ofNullable;
import static org.springframework.util.StringUtils.hasText;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.FieldSort;
import co.elastic.clients.elasticsearch._types.FieldValue;
import co.elastic.clients.elasticsearch._types.SortOptions;
import co.elastic.clients.elasticsearch._types.SortOrder;
import co.elastic.clients.elasticsearch._types.aggregations.*;
import co.elastic.clients.elasticsearch._types.query_dsl.*;
import co.elastic.clients.elasticsearch.core.*;
import co.elastic.clients.elasticsearch.core.bulk.BulkResponseItem;
import co.elastic.clients.elasticsearch.core.search.Hit;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.config.EngineConfig;
import io.openbas.database.model.CustomDashboardParameters;
import io.openbas.database.model.Filters;
import io.openbas.database.model.IndexingStatus;
import io.openbas.database.raw.RawUserAuth;
import io.openbas.database.repository.IndexingStatusRepository;
import io.openbas.driver.ElasticDriver;
import io.openbas.engine.EngineContext;
import io.openbas.engine.EngineService;
import io.openbas.engine.EsModel;
import io.openbas.engine.Handler;
import io.openbas.engine.api.*;
import io.openbas.engine.api.DateHistogramWidget.DateHistogramSeries;
import io.openbas.engine.api.StructuralHistogramWidget.StructuralHistogramSeries;
import io.openbas.engine.model.EsBase;
import io.openbas.engine.model.EsSearch;
import io.openbas.engine.query.EsSeries;
import io.openbas.engine.query.EsSeriesData;
import io.openbas.exception.AnalyticsEngineException;
import io.openbas.schema.PropertySchema;
import jakarta.annotation.Resource;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.io.IOException;
import java.lang.reflect.ParameterizedType;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.extern.slf4j.Slf4j;
import org.apache.logging.log4j.util.Strings;
import org.springframework.dao.DataIntegrityViolationException;

@Slf4j
public class ElasticService implements EngineService {

  private final ElasticDriver driver;
  private final EngineContext searchEngine;
  private final ElasticsearchClient elasticClient;
  private final IndexingStatusRepository indexingStatusRepository;
  private final EngineConfig engineConfig;
  private final CommonSearchService commonSearchService;

  @Resource protected ObjectMapper mapper;

  public ElasticService(
      EngineContext searchEngine,
      ElasticDriver driver,
      IndexingStatusRepository indexingStatusRepository,
      EngineConfig engineConfig,
      CommonSearchService commonSearchService)
      throws Exception {
    this.driver = driver;
    this.elasticClient = driver.elasticClient();
    this.searchEngine = searchEngine;
    this.indexingStatusRepository = indexingStatusRepository;
    this.engineConfig = engineConfig;
    this.commonSearchService = commonSearchService;
  }

  private FieldValue toVal(String field, String value, Map<String, String> parameters) {
    FieldValue.Builder builder = new FieldValue.Builder();
    String target = ofNullable(parameters.getOrDefault(value, value)).orElse("");
    PropertySchema propertyField = commonSearchService.getIndexingSchema().get(field);
    if (propertyField == null) {
      throw new AnalyticsEngineException("Unknown field: " + field);
    }
    if (propertyField.getType().isAssignableFrom(String.class)
        || (propertyField.getType().isAssignableFrom(Set.class)
            && propertyField.getSubtype() instanceof ParameterizedType
            && String.class.equals(
                ((ParameterizedType) propertyField.getSubtype()).getActualTypeArguments()[0]))) {
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
  private Query queryFromBaseFilter(
      Filters.Filter filter,
      Map<String, String> parameters,
      Map<String, CustomDashboardParameters> definitionParameters) {
    Filters.FilterOperator operator = filter.getOperator();
    BoolQuery.Builder boolQuery = new BoolQuery.Builder();
    Filters.FilterMode filterMode = filter.getMode();
    String field = filter.getKey();
    String elasticField = toElasticField(field);
    PropertySchema propertyField = commonSearchService.getIndexingSchema().get(field);
    boolean hasFilteringValues =
        filter.getValues().stream()
            .anyMatch(
                value -> {
                  CustomDashboardParameters parameter = definitionParameters.get(value);
                  String computeValue = parameters.getOrDefault(value, "");
                  return parameter == null
                      || !parameter.getType().isInstance
                      || hasText(computeValue);
                });
    switch (operator) {
      case eq:
        if (hasFilteringValues) {
          List<Query> queryList =
              filter.getValues().stream()
                  .map(
                      v ->
                          TermQuery.of(
                                  t -> t.field(elasticField).value(toVal(field, v, parameters)))
                              ._toQuery())
                  .toList();
          if (filterMode == Filters.FilterMode.and) {
            boolQuery.must(queryList);
          } else {
            boolQuery.should(queryList).minimumShouldMatch("1");
          }
        }
        break;
      case not_eq:
        if (hasFilteringValues) {
          List<Query> queryNotList =
              filter.getValues().stream()
                  .map(
                      v ->
                          TermQuery.of(
                                  t -> t.field(elasticField).value(toVal(field, v, parameters)))
                              ._toQuery())
                  .toList();
          boolQuery.mustNot(queryNotList);
        }
        break;
      case contains:
        List<Query> containsQueries =
            filter.getValues().stream()
                .map(
                    v -> {
                      FieldValue val = toVal(field, v, parameters);
                      if (propertyField.isKeyword()) {
                        // Champ keyword : wildcard
                        return WildcardQuery.of(
                                w ->
                                    w.field(toElasticField(field))
                                        .value("*" + val.stringValue() + "*"))
                            ._toQuery();
                      } else {
                        // Champ text : match
                        return MatchQuery.of(m -> m.field(toElasticField(field)).query(val))
                            ._toQuery();
                      }
                    })
                .toList();

        if (filterMode == Filters.FilterMode.and) {
          boolQuery.must(containsQueries);
        } else {
          boolQuery.should(containsQueries).minimumShouldMatch("1");
        }
        break;
      case not_contains:
        List<Query> notContainsQueries =
            filter.getValues().stream()
                .map(
                    v -> {
                      FieldValue val = toVal(field, v, parameters);
                      if (propertyField.isKeyword()) {
                        return WildcardQuery.of(
                                w -> w.field(elasticField).value("*" + val.stringValue() + "*"))
                            ._toQuery();
                      } else {
                        return MatchQuery.of(m -> m.field(elasticField).query(val))._toQuery();
                      }
                    })
                .toList();
        boolQuery.mustNot(notContainsQueries);
        break;
      case empty:
        boolQuery
            .should(List.of(notExistsQuery(elasticField), emptyFieldQuery(elasticField)))
            .minimumShouldMatch("1");
        break;
      case not_empty:
        boolQuery.must(List.of(existsQuery(elasticField), notEmptyFieldQuery(elasticField)));
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
    QueryStringQuery.Builder queryStringQuery = new QueryStringQuery.Builder();
    queryStringQuery.query(search).analyzeWildcard(true).fields(BASE_FIELDS);
    return queryStringQuery.build()._toQuery();
  }

  private Query queryFromFilter(
      Filters.FilterGroup groupFilter,
      Map<String, String> parameters,
      Map<String, CustomDashboardParameters> definitionParameters) {
    Filters.FilterMode filterMode = groupFilter.getMode();
    BoolQuery.Builder filterQuery = new BoolQuery.Builder();
    List<Query> filterQueries = new ArrayList<>();
    List<Filters.Filter> filters = groupFilter.getFilters();
    filters.forEach(
        f -> filterQueries.add(queryFromBaseFilter(f, parameters, definitionParameters)));
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
      Map<String, String> parameters,
      Map<String, CustomDashboardParameters> definitionParameters) {
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
    if (groupFilter != null && groupFilter.getFilters() != null) {
      Query filterQuery = queryFromFilter(groupFilter, parameters, definitionParameters);
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
    Query query = buildQuery(user, null, filterGroup, new HashMap<>(), new HashMap<>());
    try {
      SearchResponse<EsBase> response =
          elasticClient.search(
              b -> b.index(engineConfig.getIndexPrefix() + "*").size(ids.size()).query(query),
              EsBase.class);
      List<Hit<EsBase>> hits = response.hits().hits();
      return hits.stream()
          .map(Hit::source)
          .filter(Objects::nonNull)
          .collect(Collectors.toMap(EsBase::getBase_id, EsBase::getBase_representative));
    } catch (Exception e) {
      log.error(String.format("resolveIdsRepresentative exception: %s", e.getMessage()), e);
    }
    return Map.of();
  }

  // endregion

  // region indexing
  public <T extends EsBase> void bulkProcessing(Stream<EsModel<T>> models) {
    List<IndexingStatus> statuses =
        models
            .map(
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
                                  idx ->
                                      idx.index(index).id(result.getBase_id()).document(result)));
                    }
                    // Execute the bulk
                    try {
                      log.info("Indexing ({}) in progress for {}", results.size(), model.getName());
                      BulkRequest bulkRequest = br.build();
                      BulkResponse result = elasticClient.bulk(bulkRequest);
                      // Log errors, if any
                      if (result.errors()) {
                        for (BulkResponseItem item : result.items()) {
                          if (item.error() != null) {
                            log.error(item.error().reason());
                          }
                        }
                      } else {
                        // Update the status for the next round
                        if (indexingStatus.isPresent()) {
                          IndexingStatus status = indexingStatus.get();
                          status.setLastIndexing(results.getLast().getBase_updated_at());
                          return status;
                        } else {
                          IndexingStatus status = new IndexingStatus();
                          status.setType(model.getName());
                          status.setLastIndexing(results.getLast().getBase_updated_at());
                          return status;
                        }
                      }
                    } catch (IOException e) {
                      log.error(
                          String.format("bulkParallelProcessing exception: %s", e.getMessage()), e);
                    }
                  } else {
                    log.info("Indexing <up to date> for {}", model.getName());
                  }
                  return null;
                })
            .filter(Objects::nonNull)
            .toList();
    statuses.forEach(
        (indexingStatus) -> {
          try {
            indexingStatusRepository.save(indexingStatus);
          } catch (DataIntegrityViolationException e) {
            log.warn(
                "DataIntegrityViolationException - There was a conflict. Trying to solve it ... ",
                e);
            IndexingStatus alreadyExistingStatus =
                indexingStatusRepository.findByType(indexingStatus.getType()).get();
            alreadyExistingStatus.setLastIndexing(indexingStatus.getLastIndexing());
            indexingStatusRepository.save(alreadyExistingStatus);
          }
        });
  }

  @Override
  public void cleanUpIndex(String model) throws IOException {
    driver.cleanUpIndex(model, elasticClient);
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
      log.error(String.format("bulkDelete exception: %s", e.getMessage()), e);
    }
  }

  // endregion

  // region query
  public long count(RawUserAuth user, CountRuntime runtime) {
    FlatConfiguration widgetConfig = runtime.getConfig();

    BoolQuery.Builder queryBuilder = new BoolQuery.Builder();

    try {
      Query countQuery =
          buildQuery(
              user,
              null,
              runtime
                  .getConfig()
                  .getSeries()
                  .getFirst()
                  .getFilter(), // 1 count = 1 serie limit = 1 filter group
              runtime.getParameters(),
              runtime.getDefinitionParameters());
      Query query;
      if (isAllTime(widgetConfig, runtime.getParameters(), runtime.getDefinitionParameters())) {
        query = queryBuilder.must(countQuery).build()._toQuery();
      } else {
        Instant finalStart =
            calcStartDate(widgetConfig, runtime.getParameters(), runtime.getDefinitionParameters());
        Instant finalEnd =
            calcEndDate(widgetConfig, runtime.getParameters(), runtime.getDefinitionParameters());
        Query dateRangeQuery =
            buildDateRangeQuery(widgetConfig.getDateAttribute(), finalStart, finalEnd);
        query = queryBuilder.must(dateRangeQuery, countQuery).build()._toQuery();
      }
      Query finalQuery = query;
      return elasticClient
          .count(c -> c.index(engineConfig.getIndexPrefix() + "*").query(finalQuery))
          .count();
    } catch (IOException e) {
      log.error(String.format("count exception: %s", e.getMessage()), e);
    }
    return 0;
  }

  public EsSeries termHistogram(
      RawUserAuth user,
      StructuralHistogramWidget widgetConfig,
      StructuralHistogramSeries config,
      Map<String, String> parameters,
      Map<String, CustomDashboardParameters> definitionParameters) {

    BoolQuery.Builder queryBuilder = new BoolQuery.Builder();
    Query filterQuery =
        buildQuery(user, null, config.getFilter(), parameters, definitionParameters);
    Query query;
    if (isAllTime(widgetConfig, parameters, definitionParameters)) {
      query = queryBuilder.must(filterQuery).build()._toQuery();
    } else {
      Instant finalStart = calcStartDate(widgetConfig, parameters, definitionParameters);
      Instant finalEnd = calcEndDate(widgetConfig, parameters, definitionParameters);
      Query dateRangeQuery =
          buildDateRangeQuery(widgetConfig.getDateAttribute(), finalStart, finalEnd);
      query = queryBuilder.must(dateRangeQuery, filterQuery).build()._toQuery();
    }

    String aggregationKey = "term_histogram";
    try {
      String field = parameters.getOrDefault(widgetConfig.getField(), widgetConfig.getField());
      PropertySchema propertyField = commonSearchService.getIndexingSchema().get(field);
      String elasticField = toElasticField(field);

      SearchRequest.Builder searchBuilder =
          new SearchRequest.Builder()
              .index(engineConfig.getIndexPrefix() + "*")
              .size(0)
              .query(query);

      // Avoid this exception
      // co.elastic.clients.elasticsearch._types.ElasticsearchException: [es/search] failed:
      // [x_content_parse_exception] [1:82] [terms] failed to parse field [size]
      if (widgetConfig.getLimit() > 0) {
        TermsAggregation termsAggregation =
            new TermsAggregation.Builder()
                .field(elasticField)
                .size(widgetConfig.getLimit())
                .build();

        searchBuilder.aggregations(
            aggregationKey, new Aggregation.Builder().terms(termsAggregation).build());
      }

      SearchResponse<Void> response = elasticClient.search(searchBuilder.build(), Void.class);

      if (widgetConfig.getLimit() == 0) {
        return new EsSeries(config.getName());
      }

      Aggregate aggregate = response.aggregations().get(aggregationKey);
      if (propertyField.getType() == Double.class) {
        return termHistogramDTerms(config, aggregate);
      } else if (propertyField.getType() == Long.class
          || propertyField.getType() == Boolean.class) {
        return termHistogramLTerms(config, aggregate);
      } else {
        return termHistogramSTerms(user, config, aggregate, field);
      }
    } catch (Exception e) {
      log.error(String.format("termHistogram exception: %s", e.getMessage()), e);
    }
    return new EsSeries(config.getName());
  }

  private EsSeries termHistogramSTerms(
      @NotNull final RawUserAuth user,
      @NotNull final StructuralHistogramSeries config,
      @NotNull final Aggregate aggregate,
      @NotNull final String field) {
    boolean isSideAggregation = field.endsWith("_side");
    Buckets<StringTermsBucket> buckets = aggregate.sterms().buckets();
    Map<String, String> resolutions = new HashMap<>();
    if (isSideAggregation) {
      List<String> ids =
          buckets.array().stream()
              .flatMap(s -> Arrays.stream(s.key().stringValue().split(",")))
              .distinct()
              .toList();
      resolutions.putAll(resolveIdsRepresentative(user, ids));
    }
    List<EsSeriesData> data =
        buckets.array().stream()
            .map(
                b -> {
                  String key = b.key().stringValue();
                  String label = isSideAggregation ? resolutions.get(key) : key;
                  String seriesKey = label != null ? label : "deleted";
                  return new EsSeriesData(key, seriesKey, b.docCount());
                })
            .toList();
    return new EsSeries(config.getName(), data);
  }

  private EsSeries termHistogramDTerms(
      @NotNull final StructuralHistogramSeries config, @NotNull final Aggregate aggregate) {
    Buckets<DoubleTermsBucket> buckets = aggregate.dterms().buckets();
    List<EsSeriesData> data =
        buckets.array().stream()
            .map(
                b -> {
                  String key = String.valueOf(b.key());
                  return new EsSeriesData(key, key, b.docCount());
                })
            .toList();
    return new EsSeries(config.getName(), data);
  }

  private EsSeries termHistogramLTerms(
      @NotNull final StructuralHistogramSeries config, @NotNull final Aggregate aggregate) {
    Buckets<LongTermsBucket> buckets = aggregate.lterms().buckets();
    List<EsSeriesData> data =
        buckets.array().stream()
            .map(
                b -> {
                  String key = String.valueOf(b.key());
                  return new EsSeriesData(key, key, b.docCount());
                })
            .toList();
    return new EsSeries(config.getName(), data);
  }

  public List<EsSeries> multiTermHistogram(RawUserAuth user, StructuralHistogramRuntime runtime) {
    Map<String, String> parameters = runtime.getParameters();
    Map<String, CustomDashboardParameters> definitionParameters = runtime.getDefinitionParameters();
    return runtime.getWidget().getSeries().stream()
        .parallel()
        .map(c -> termHistogram(user, runtime.getWidget(), c, parameters, definitionParameters))
        .toList();
  }

  public EsSeries dateHistogram(
      RawUserAuth user,
      DateHistogramWidget widgetConfig,
      DateHistogramSeries config,
      Map<String, String> parameters,
      Map<String, CustomDashboardParameters> definitionParameters) {
    BoolQuery.Builder queryBuilder = new BoolQuery.Builder();

    Query filterQuery =
        buildQuery(user, null, config.getFilter(), parameters, definitionParameters);

    Instant finalStart = calcStartDate(widgetConfig, parameters, definitionParameters);
    Instant finalEnd = calcEndDate(widgetConfig, parameters, definitionParameters);

    Query query;
    if (isAllTime(widgetConfig, parameters, definitionParameters)) {
      query = queryBuilder.must(filterQuery).build()._toQuery();
    } else {
      Query dateRangeQuery =
          buildDateRangeQuery(widgetConfig.getDateAttribute(), finalStart, finalEnd);
      query = queryBuilder.must(dateRangeQuery, filterQuery).build()._toQuery();
    }
    try {
      String aggregationKey = "date_histogram";

      ExtendedBounds<FieldDateMath> extendedBounds;
      if (isAllTime(widgetConfig, parameters, definitionParameters)) {
        extendedBounds = null;
      } else {
        ExtendedBounds.Builder<FieldDateMath> bounds = new ExtendedBounds.Builder<>();
        bounds.min(FieldDateMath.of(m -> m.value((double) finalStart.toEpochMilli())));
        bounds.max(FieldDateMath.of(m -> m.value((double) finalEnd.toEpochMilli())));
        extendedBounds = bounds.build();
      }
      SearchResponse<Void> response =
          elasticClient.search(
              b ->
                  b.index(engineConfig.getIndexPrefix() + "*")
                      .size(0)
                      .query(query)
                      .aggregations(
                          aggregationKey,
                          a ->
                              buildDateHistogramAggregation(
                                  a,
                                  widgetConfig.getDateAttribute(),
                                  widgetConfig.getInterval(),
                                  extendedBounds)),
              Void.class);
      Buckets<DateHistogramBucket> buckets =
          response.aggregations().get(aggregationKey).dateHistogram().buckets();
      List<EsSeriesData> data =
          buckets.array().stream()
              .map(
                  b ->
                      new EsSeriesData(
                          b.keyAsString(), Instant.ofEpochMilli(b.key()).toString(), b.docCount()))
              .toList();
      return new EsSeries(config.getName(), data);
    } catch (IOException e) {
      log.error(String.format("dateHistogram exception: %s", e.getMessage()), e);
    }
    return new EsSeries(config.getName());
  }

  public List<EsSeries> multiDateHistogram(RawUserAuth user, DateHistogramRuntime runtime) {
    Map<String, String> parameters = runtime.getParameters();
    Map<String, CustomDashboardParameters> definitionParameters = runtime.getDefinitionParameters();
    return runtime.getWidget().getSeries().stream()
        .parallel()
        .map(c -> dateHistogram(user, runtime.getWidget(), c, parameters, definitionParameters))
        .toList();
  }

  public List<EsBase> entities(RawUserAuth user, ListRuntime runtime) {
    Filters.FilterGroup searchFilters = runtime.getWidget().getPerspective().getFilter();
    String entityName =
        searchFilters.getFilters().stream()
            .filter(filter -> "base_entity".equals(filter.getKey()))
            .findAny()
            .orElseThrow()
            .getValues()
            .getFirst();
    List<EngineSortField> sorts = runtime.getWidget().getSorts();

    List<SortOptions> engineSorts;
    if (sorts != null && !sorts.isEmpty()) {
      engineSorts =
          sorts.stream()
              .map(
                  sort ->
                      SortOptions.of(
                          so ->
                              so.field(
                                  FieldSort.of(
                                      fs ->
                                          fs.field(toElasticField(sort.getFieldName()))
                                              .order(
                                                  sort.getDirection() == SortDirection.DESC
                                                      ? SortOrder.Desc
                                                      : SortOrder.Asc)))))
              .toList();
    } else {
      engineSorts =
          List.of(
              SortOptions.of(
                  so -> so.field(FieldSort.of(fs -> fs.field("_score").order(SortOrder.Desc)))));
    }
    BoolQuery.Builder queryBuilder = new BoolQuery.Builder();
    ListConfiguration widgetConfig = runtime.getWidget();
    Query listQuery =
        buildQuery(
            user, "", searchFilters, runtime.getParameters(), runtime.getDefinitionParameters());
    try {
      Query query;
      if (isAllTime(widgetConfig, runtime.getParameters(), runtime.getDefinitionParameters())) {
        query = queryBuilder.must(listQuery).build()._toQuery();
      } else {
        Instant finalStart =
            calcStartDate(widgetConfig, runtime.getParameters(), runtime.getDefinitionParameters());
        Instant finalEnd =
            calcEndDate(widgetConfig, runtime.getParameters(), runtime.getDefinitionParameters());
        Query dateRangeQuery =
            buildDateRangeQuery(widgetConfig.getDateAttribute(), finalStart, finalEnd);
        query = queryBuilder.must(dateRangeQuery, listQuery).build()._toQuery();
      }
      Query finalQuery = query;
      SearchResponse<?> response =
          elasticClient.search(
              b ->
                  b.index(engineConfig.getIndexPrefix() + "*")
                      .size(runtime.getWidget().getLimit())
                      .query(finalQuery)
                      .sort(engineSorts),
              getClassForEntity(entityName));
      return response.hits().hits().stream()
          .filter(hit -> hit.source() != null)
          .map(hit -> (EsBase) hit.source())
          .toList();
    } catch (IOException e) {
      log.error("query exception: {}", e.getMessage(), e);
    }
    return List.of();
  }

  private Class<?> getClassForEntity(String entity_name) {
    Optional<EsModel<EsBase>> model =
        searchEngine.getModels().stream()
            .filter(esBaseEsModel -> entity_name.equals(esBaseEsModel.getName()))
            .findAny();
    return model.get().getModel();
  }

  /**
   * Create a list configuration for the given entity name and filter value map.
   *
   * @param entityName the name of the entity to filter on
   * @param filterValueMap a map of filter
   * @return a ListConfiguration object
   */
  public ListConfiguration createListConfiguration(
      String entityName, Map<String, List<String>> filterValueMap) {
    // Create filters
    List<Filters.Filter> filters = new ArrayList<>();
    filters.add(Filters.Filter.getNewDefaultEqualFilter("base_entity", List.of(entityName)));
    filterValueMap.forEach((k, v) -> filters.add(Filters.Filter.getNewDefaultEqualFilter(k, v)));

    // Create group filter
    Filters.FilterGroup filterGroup = Filters.FilterGroup.defaultFilterGroup();
    filterGroup.setFilters(filters);

    // Create sort configuration
    EngineSortField engineSortField = new EngineSortField();
    engineSortField.setFieldName("base_updated_at");
    engineSortField.setDirection(SortDirection.DESC);

    // Create series
    ListConfiguration.ListPerspective listPerspective = new ListConfiguration.ListPerspective();
    listPerspective.setName("Attack Paths");
    listPerspective.setFilter(filterGroup);

    // Create list configuration
    ListConfiguration listConfiguration = new ListConfiguration();
    listConfiguration.setSorts(List.of(engineSortField));
    listConfiguration.setPerspective(listPerspective);
    return listConfiguration;
  }

  public List<EsSearch> search(RawUserAuth user, String search, Filters.FilterGroup filter) {
    Query query = buildQuery(user, search, filter, new HashMap<>(), new HashMap<>());
    try {
      SearchResponse<EsSearch> response =
          elasticClient.search(
              b ->
                  b.index(engineConfig.getIndexPrefix() + "*")
                      .size(engineConfig.getSearchCap())
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
      log.error(String.format("query exception: %s", e.getMessage()), e);
    }
    return List.of();
  }

  @Override
  public String getEngineVersion() {
    try {
      Set<String> versions = new HashSet<>();
      mapper
          .readTree(elasticClient.cluster().state().valueBody().toJson().toString())
          .get("nodes")
          .elements()
          .forEachRemaining(jsonNode -> versions.add(jsonNode.get("version").textValue()));
      return Strings.join(versions, ',');
    } catch (IOException e) {
      log.warn("Unable to retrieve engine version", e);
    }
    return null;
  }

  // endregion

  private String toElasticField(@NotBlank final String field) {
    PropertySchema propertyField = commonSearchService.getIndexingSchema().get(field);
    return propertyField.isKeyword() ? (field + ".keyword") : field;
  }
}
