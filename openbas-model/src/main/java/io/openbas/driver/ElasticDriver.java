package io.openbas.driver;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.ElasticsearchException;
import co.elastic.clients.elasticsearch._types.analysis.CustomNormalizer;
import co.elastic.clients.elasticsearch._types.analysis.Normalizer;
import co.elastic.clients.elasticsearch._types.mapping.*;
import co.elastic.clients.elasticsearch.cluster.PutComponentTemplateRequest;
import co.elastic.clients.elasticsearch.ilm.*;
import co.elastic.clients.elasticsearch.indices.*;
import co.elastic.clients.elasticsearch.indices.put_index_template.IndexTemplateMapping;
import co.elastic.clients.json.JsonData;
import co.elastic.clients.json.jackson.JacksonJsonpMapper;
import co.elastic.clients.transport.ElasticsearchTransport;
import co.elastic.clients.transport.rest_client.RestClientTransport;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.openbas.engine.EsEngine;
import io.openbas.engine.EsModel;
import java.io.IOException;
import java.lang.reflect.Field;
import java.lang.reflect.ParameterizedType;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.ArrayUtils;
import org.apache.http.HttpHost;
import org.elasticsearch.client.RestClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ElasticDriver {

  public static final String DATA_VERSION = "1.0";
  public static final String ELASTIC_URI = "http://localhost:9200";
  public static final String INDEX_PREFIX = "openbas";
  public static final String CORE_SETTINGS_NAME = INDEX_PREFIX + "-core-settings";
  public static final String ES_INDEX_PREFIX_ILM_POLICY = INDEX_PREFIX + "-ilm-policy";
  public static final String ES_INDEX_SUFFIX = "-000001";
  public static final String ES_INDEX_MAX_FIELDS_SIZE = "4096";
  public static final String ES_INDEX_NUMBER_OF_REPLICA = "1";
  public static final String ES_INDEX_NUMBER_OF_SHARDS = "1";
  public static final int ES_INDEX_MAX_RESULT_WINDOWS = 100000;
  public static final long ES_INDEX_MAX_PRIMARY_SHARDS_DOCS = 75000000;
  public static final String ES_INDEX_MAX_PRIMARY_SHARDS_SIZE = "10Gb";

  private EsEngine esEngine;

  @Autowired
  public void setEsEngine(EsEngine esEngine) {
    this.esEngine = esEngine;
  }

  public ElasticsearchClient getElasticClient() {
    RestClient restClient = RestClient.builder(HttpHost.create(ELASTIC_URI)).build();
    JacksonJsonpMapper jsonpMapper = new JacksonJsonpMapper();
    jsonpMapper.objectMapper().registerModule(new JavaTimeModule());
    jsonpMapper.objectMapper().configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
    ElasticsearchTransport transport = new RestClientTransport(restClient, jsonpMapper);
    return new ElasticsearchClient(transport);
  }

  private void createRolloverPolicy(ElasticsearchClient client) throws IOException {
    PutLifecycleRequest lifecycleRequest =
        new PutLifecycleRequest.Builder()
            .name(ES_INDEX_PREFIX_ILM_POLICY)
            .policy(
                new IlmPolicy.Builder()
                    .phases(
                        new Phases.Builder()
                            .hot(
                                new Phase.Builder()
                                    .actions(
                                        new Actions.Builder()
                                            .rollover(
                                                new RolloverAction.Builder()
                                                    .maxPrimaryShardDocs(
                                                        ES_INDEX_MAX_PRIMARY_SHARDS_DOCS)
                                                    .maxPrimaryShardSize(
                                                        ES_INDEX_MAX_PRIMARY_SHARDS_SIZE)
                                                    .build())
                                            .setPriority(
                                                new SetPriorityAction.Builder()
                                                    .priority(100)
                                                    .build())
                                            .build())
                                    .build())
                            .build())
                    .build())
            .build();
    client.ilm().putLifecycle(lifecycleRequest);
  }

  private void createCoreSettings(ElasticsearchClient client) throws IOException {
    PutComponentTemplateRequest.Builder coreSettings = new PutComponentTemplateRequest.Builder();
    coreSettings.name(CORE_SETTINGS_NAME);
    coreSettings.create(false);
    coreSettings.template(
        new IndexState.Builder()
            .settings(
                new IndexSettings.Builder()
                    .maxResultWindow(ES_INDEX_MAX_RESULT_WINDOWS)
                    .numberOfReplicas(ES_INDEX_NUMBER_OF_REPLICA)
                    .numberOfShards(ES_INDEX_NUMBER_OF_SHARDS)
                    .analysis(
                        new IndexSettingsAnalysis.Builder()
                            .normalizer(
                                "string_normalizer",
                                new Normalizer.Builder()
                                    .custom(
                                        new CustomNormalizer.Builder()
                                            .filter("lowercase", "asciifolding")
                                            .build())
                                    .build())
                            .build())
                    .build())
            .build());
    client.cluster().putComponentTemplate(coreSettings.build());
  }

  private void createIndex(
      ElasticsearchClient client, String name, String version, Map<String, Property> mappings)
      throws IOException {
    // Create template
    String indexName = INDEX_PREFIX + "_" + name;
    PutIndexTemplateRequest.Builder mapping = new PutIndexTemplateRequest.Builder();
    mapping.name(indexName);
    mapping.meta("version", JsonData.of(version));
    mapping.indexPatterns(indexName + "*");
    mapping.composedOf(CORE_SETTINGS_NAME);
    TypeMapping indexMapping =
        new TypeMapping.Builder()
            .dynamic(DynamicMapping.Strict)
            .dateDetection(false)
            .numericDetection(false)
            .properties(mappings)
            .build();
    mapping.template(
        new IndexTemplateMapping.Builder()
            .settings(
                new IndexSettings.Builder()
                    .lifecycle(
                        new IndexSettingsLifecycle.Builder()
                            .name(ES_INDEX_PREFIX_ILM_POLICY)
                            .rolloverAlias(indexName)
                            .build())
                    .mapping(
                        new MappingLimitSettings.Builder()
                            .totalFields(
                                new MappingLimitSettingsTotalFields.Builder()
                                    .limit(ES_INDEX_MAX_FIELDS_SIZE)
                                    .build())
                            .build())
                    .build())
            .mappings(indexMapping)
            .build());
    try {
      client.indices().putIndexTemplate(mapping.build());
    } catch (Exception e) {
      throw new IOException(e);
    }
    // Create index
    try {
      client.indices().get(new GetIndexRequest.Builder().index(indexName).build());
    } catch (ElasticsearchException e) {
      client
          .indices()
          .create(
              new CreateIndexRequest.Builder()
                  .index(indexName + ES_INDEX_SUFFIX)
                  .aliases(indexName, new Alias.Builder().build())
                  .build());
    }
  }

  private Map<String, Property> mappingGeneratorForClass(EsModel<?> esModel) {
    Property subKeyword =
        new Property.Builder()
            .keyword(
                new KeywordProperty.Builder()
                    .ignoreAbove(512)
                    .normalizer("string_normalizer")
                    .build())
            .build();

    Map<String, Property> mappings = new HashMap<>();
    Class<?> model = esModel.getModel();
    Field[] parentFields = model.getSuperclass().getDeclaredFields();
    Field[] directFields = model.getDeclaredFields();
    Field[] fields = ArrayUtils.addAll(directFields, parentFields);
    for (Field field : fields) {
      Class<?> fieldType = field.getType();
      if (List.class.isAssignableFrom(field.getType())) {
        ParameterizedType fieldGenericType = (ParameterizedType) field.getGenericType();
        fieldType = (Class<?>) fieldGenericType.getActualTypeArguments()[0];
      }
      if (fieldType == String.class) {
        mappings.put(
            field.getName(),
            new Property.Builder()
                .text(new TextProperty.Builder().fields("keyword", subKeyword).build())
                .build());
      } else if (fieldType == Instant.class) {
        mappings.put(
            field.getName(),
            new Property.Builder()
                // .dateNanos(new DateNanosProperty.Builder().build())
                .date(new DateProperty.Builder().build())
                .build());
      } else {
        throw new RuntimeException("Unsupported field type: " + fieldType);
      }
    }
    return mappings;
  }

  @Bean
  public ElasticsearchClient elasticClient() throws Exception {
    System.out.println("Creating ElasticClient");
    ElasticsearchClient elasticClient = getElasticClient();
    // TODO enable telemetry ?
    // https://www.elastic.co/guide/en/elasticsearch/client/java-api-client/current/opentelemetry.html
    // Initialize elastic if needed.
    createRolloverPolicy(elasticClient);
    createCoreSettings(elasticClient);
    // TODO Fetch the current model versions
    // | type     | last_updated_at      | version db | elastic version
    // | findings | 2024-12-04T12:00:00Z | 2.0        | 1.0
    // If version of the model stored in elastic is different from the db version
    // Index + template must be removed and recreated
    // last_updated_at for the type must be reset to reindex the full data.
    List<EsModel<?>> models = this.esEngine.getModels();
    models.stream()
        .parallel()
        .forEach(
            esModel -> {
              Map<String, Property> mappings = mappingGeneratorForClass(esModel);
              try {
                System.out.println("Creating Index " + esModel.getName());
                createIndex(elasticClient, esModel.getName(), DATA_VERSION, mappings);
              } catch (IOException e) {
                throw new RuntimeException(e);
              }
            });
    return elasticClient;
  }
}
