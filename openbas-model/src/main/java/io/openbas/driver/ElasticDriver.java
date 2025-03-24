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
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.openbas.config.EngineConfig;
import io.openbas.engine.EsEngine;
import io.openbas.engine.EsModel;
import java.io.IOException;
import java.lang.reflect.Field;
import java.lang.reflect.ParameterizedType;
import java.security.cert.X509Certificate;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.logging.Logger;
import javax.net.ssl.SSLContext;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.ArrayUtils;
import org.apache.http.HttpHost;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.conn.ssl.NoopHostnameVerifier;
import org.apache.http.impl.client.BasicCredentialsProvider;
import org.apache.http.impl.nio.client.HttpAsyncClientBuilder;
import org.apache.http.ssl.SSLContextBuilder;
import org.elasticsearch.client.RestClient;
import org.elasticsearch.client.RestClientBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ElasticDriver {

  private static final Logger LOGGER = Logger.getLogger(ElasticDriver.class.getName());
  public static final String ES_MODEL_VERSION = "1.0";
  public static final String ES_ILM_POLICY = "-ilm-policy";
  public static final String ES_CORE_SETTINGS = "-core-settings";

  private EsEngine esEngine;
  private final EngineConfig config;

  @Autowired
  public void setEsEngine(EsEngine esEngine) {
    this.esEngine = esEngine;
  }

  public ElasticsearchClient getElasticClient() {
    RestClientBuilder restClientBuilder = RestClient.builder(HttpHost.create(config.getUrl()));
    HttpAsyncClientBuilder clientBuilder = HttpAsyncClientBuilder.create();
    if (config.getUsername() != null) {
      BasicCredentialsProvider credsProv = new BasicCredentialsProvider();
      credsProv.setCredentials(
          AuthScope.ANY,
          new UsernamePasswordCredentials(config.getUsername(), config.getPassword()));
      clientBuilder.setDefaultCredentialsProvider(credsProv);
    }
    if (!config.isRejectUnauthorized()) {
      // Create an SSLContext that trusts all certificates
      try {
        SSLContext sslContext =
            SSLContextBuilder.create()
                .loadTrustMaterial(null, (X509Certificate[] chain, String authType) -> true)
                .build();
        clientBuilder
            .setSSLContext(sslContext)
            .setSSLHostnameVerifier(NoopHostnameVerifier.INSTANCE);
      } catch (Exception e) {
        throw new RuntimeException(e);
      }
    }
    restClientBuilder.setHttpClientConfigCallback(hc -> clientBuilder);
    RestClient restClient = restClientBuilder.build();
    JacksonJsonpMapper jsonpMapper = new JacksonJsonpMapper();
    jsonpMapper.objectMapper().registerModule(new JavaTimeModule());
    jsonpMapper.objectMapper().configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
    jsonpMapper.objectMapper().configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    ElasticsearchTransport transport = new RestClientTransport(restClient, jsonpMapper);
    return new ElasticsearchClient(transport);
  }

  private void createRolloverPolicy(ElasticsearchClient client) throws IOException {
    PutLifecycleRequest lifecycleRequest =
        new PutLifecycleRequest.Builder()
            .name(config.getIndexPrefix() + ES_ILM_POLICY)
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
                                                        config.getMaxPrimaryShardDocs())
                                                    .maxPrimaryShardSize(
                                                        config.getMaxPrimaryShardsSize())
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
    coreSettings.name(config.getIndexPrefix() + ES_CORE_SETTINGS);
    coreSettings.create(false);
    coreSettings.template(
        new IndexState.Builder()
            .settings(
                new IndexSettings.Builder()
                    .maxResultWindow(config.getMaxResultWindow())
                    .numberOfReplicas(config.getNumberOfReplicas())
                    .numberOfShards(config.getNumberOfShards())
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

  @SuppressWarnings("SameParameterValue")
  private void createIndex(
      ElasticsearchClient client, String name, String version, Map<String, Property> mappings)
      throws IOException {
    // Create template
    String indexName = config.getIndexPrefix() + "_" + name;
    String coreSettings = config.getIndexPrefix() + ES_CORE_SETTINGS;
    String ilmPolicy = config.getIndexPrefix() + ES_ILM_POLICY;
    PutIndexTemplateRequest.Builder mapping = new PutIndexTemplateRequest.Builder();
    mapping.name(indexName);
    mapping.meta("version", JsonData.of(version));
    mapping.indexPatterns(indexName + "*");
    mapping.composedOf(coreSettings);
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
                            .name(ilmPolicy)
                            .rolloverAlias(indexName)
                            .build())
                    .mapping(
                        new MappingLimitSettings.Builder()
                            .totalFields(
                                new MappingLimitSettingsTotalFields.Builder()
                                    .limit(config.getMaxFieldsSize())
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
                  .index(indexName + config.getIndexSuffix())
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
      if (List.class.isAssignableFrom(field.getType()) || Set.class.isAssignableFrom(fieldType)) {
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
    LOGGER.info("Creating ElasticClient");
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
                LOGGER.info("Creating Index " + esModel.getName());
                createIndex(elasticClient, esModel.getName(), ES_MODEL_VERSION, mappings);
              } catch (IOException e) {
                throw new RuntimeException(e);
              }
            });
    return elasticClient;
  }
}
