package io.openaev.engine;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import io.openaev.exception.StartupException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

@DisplayName("Engine type detection from the engine root response")
class EngineTypeTest {

  @Nested
  @DisplayName("Elasticsearch")
  class Elasticsearch {

    @ParameterizedTest(name = "{0} -> {1}")
    @CsvSource({
      "8.19.15, ELASTICSEARCH_8",
      "8.19.0-SNAPSHOT, ELASTICSEARCH_8",
      "8.15.0, ELASTICSEARCH_8",
      "9.0.0, ELASTICSEARCH_9",
      "9.5.1, ELASTICSEARCH_9",
      "10.0.0, ELASTICSEARCH_9",
    })
    @DisplayName("given an Elasticsearch version, should pick the client of its major")
    void given_elasticsearchVersion_should_pickClientOfItsMajor(
        String version, EngineType expected) {
      // Act
      EngineType type = EngineType.fromServerInfo(null, version);

      // Assert
      assertEquals(expected, type);
    }

    @ParameterizedTest
    @ValueSource(strings = {"7.17.0", "6.8.23"})
    @DisplayName("given an Elasticsearch older than 8, should refuse to start")
    void given_elasticsearchOlderThan8_should_refuseToStart(String version) {
      // Act
      StartupException exception =
          assertThrows(StartupException.class, () -> EngineType.fromServerInfo(null, version));

      // Assert
      assertEquals(
          "Unsupported Elasticsearch version "
              + version
              + ": Elasticsearch 8.19 or later is required",
          exception.getMessage());
    }
  }

  @Nested
  @DisplayName("OpenSearch")
  class OpenSearch {

    @ParameterizedTest
    @ValueSource(strings = {"3.9.0", "2.19.1", "7.10.2"})
    @DisplayName("given the opensearch distribution, should pick OpenSearch whatever the version")
    void given_opensearchDistribution_should_pickOpenSearch(String version) {
      // Act
      EngineType type = EngineType.fromServerInfo(EngineType.OPENSEARCH_DISTRIBUTION, version);

      // Assert
      assertEquals(EngineType.OPENSEARCH, type);
    }
  }

  @Nested
  @DisplayName("Unreadable answers")
  class Unreadable {

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {"latest", "x.1.0"})
    @DisplayName("given a missing or malformed version, should refuse to start")
    void given_malformedVersion_should_refuseToStart(String version) {
      // Act & Assert
      assertThrows(StartupException.class, () -> EngineType.fromServerInfo(null, version));
    }

    @Test
    @DisplayName("given an unknown distribution, should refuse to start")
    void given_unknownDistribution_should_refuseToStart() {
      // Act
      StartupException exception =
          assertThrows(StartupException.class, () -> EngineType.fromServerInfo("solr", "9.0.0"));

      // Assert
      assertEquals(
          "Unsupported search engine distribution 'solr': only Elasticsearch and OpenSearch are"
              + " supported",
          exception.getMessage());
    }
  }
}
