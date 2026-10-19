package io.openaev.engine;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import io.openaev.config.EngineConfig;
import io.openaev.database.repository.IndexingStatusRepository;
import io.openaev.engine.impl.elasticsearch.es8.ElasticDriver;
import io.openaev.engine.impl.opensearch.os3.OpenSearchDriver;
import io.openaev.service.CommonSearchService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.env.Environment;

@ExtendWith(MockitoExtension.class)
@DisplayName("Engine component (engine auto-detection)")
class EngineComponentTest {

  @Mock private EngineContext searchEngine;
  @Mock private OpenSearchDriver openSearchDriver;
  @Mock private ElasticDriver elasticDriver8;
  @Mock private io.openaev.engine.impl.elasticsearch.es9.ElasticDriver elasticDriver9;
  @Mock private IndexingStatusRepository indexingStatusRepository;
  @Mock private CommonSearchService commonSearchService;
  @Mock private EngineVersionProbe engineVersionProbe;
  @Mock private Environment environment;

  private EngineConfig config;
  private EngineComponent engineComponent;

  @BeforeEach
  void setUp() {
    this.config = new EngineConfig();
    this.config.setUrl("http://localhost:9200");
    this.engineComponent =
        new EngineComponent(
            this.config,
            this.searchEngine,
            this.openSearchDriver,
            this.elasticDriver8,
            this.elasticDriver9,
            this.indexingStatusRepository,
            this.commonSearchService,
            this.engineVersionProbe,
            this.environment);
  }

  @Nested
  @DisplayName("Classic connection")
  class ClassicConnection {

    @Test
    @DisplayName("given an Elasticsearch 8 server, should pick the Elasticsearch 8 client")
    void given_elasticsearch8Server_should_pickElasticsearch8Client() {
      // Arrange
      when(engineVersionProbe.detect())
          .thenReturn(new EngineVersionProbe.ServerInfo(null, "8.19.15"));

      // Act
      EngineType type = engineComponent.detectEngineType();

      // Assert
      assertEquals(EngineType.ELASTICSEARCH_8, type);
    }

    @Test
    @DisplayName("given an Elasticsearch 9 server, should pick the Elasticsearch 9 client")
    void given_elasticsearch9Server_should_pickElasticsearch9Client() {
      // Arrange
      when(engineVersionProbe.detect())
          .thenReturn(new EngineVersionProbe.ServerInfo(null, "9.5.1"));

      // Act
      EngineType type = engineComponent.detectEngineType();

      // Assert
      assertEquals(EngineType.ELASTICSEARCH_9, type);
    }

    @Test
    @DisplayName("given an OpenSearch server, should pick the OpenSearch client")
    void given_opensearchServer_should_pickOpenSearchClient() {
      // Arrange
      when(engineVersionProbe.detect())
          .thenReturn(new EngineVersionProbe.ServerInfo("opensearch", "3.9.0"));

      // Act
      EngineType type = engineComponent.detectEngineType();

      // Assert
      assertEquals(EngineType.OPENSEARCH, type);
    }

    @Test
    @DisplayName("given the legacy selector is still set, should ignore it and detect the engine")
    void given_legacySelectorSet_should_ignoreItAndDetectEngine() {
      // Arrange
      when(environment.containsProperty(EngineComponent.LEGACY_SELECTOR_PROPERTY)).thenReturn(true);
      when(engineVersionProbe.detect())
          .thenReturn(new EngineVersionProbe.ServerInfo(null, "9.5.1"));

      // Act
      EngineType type = engineComponent.detectEngineType();

      // Assert
      assertEquals(EngineType.ELASTICSEARCH_9, type);
      verify(engineVersionProbe).detect();
    }
  }

  @Nested
  @DisplayName("AWS SigV4 connection")
  class AwsConnection {

    @ParameterizedTest
    @ValueSource(strings = {"es", "aoss"})
    @DisplayName("given an AWS mode, should pick OpenSearch without probing")
    void given_awsMode_should_pickOpenSearchWithoutProbing(String awsMode) {
      // Arrange
      config.setEngineAwsMode(awsMode);

      // Act
      EngineType type = engineComponent.detectEngineType();

      // Assert
      assertEquals(EngineType.OPENSEARCH, type);
      verifyNoInteractions(engineVersionProbe);
    }
  }
}
