package io.openaev.engine;

import io.openaev.exception.StartupException;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

/**
 * Search engine implementations the platform can drive, detected at startup from the server itself
 * (see {@link EngineVersionProbe}).
 *
 * <p>The {@link #getKey() key} is what the platform settings expose to the frontend, which uses it
 * as a translation key.
 */
@Getter
@Slf4j
public enum EngineType {
  ELASTICSEARCH_8("elk"),
  ELASTICSEARCH_9("elk9"),
  OPENSEARCH("opensearch");

  /**
   * Distribution reported by OpenSearch in {@code version.distribution}; absent on Elasticsearch.
   */
  public static final String OPENSEARCH_DISTRIBUTION = "opensearch";

  /** Oldest Elasticsearch 8 minor the platform supports. */
  private static final int MIN_ELASTICSEARCH_8_MINOR = 19;

  private final String key;

  EngineType(String key) {
    this.key = key;
  }

  /**
   * Picks the implementation matching the {@code GET /} answer of the engine.
   *
   * <p>OpenSearch is recognised by its distribution, whatever version number it reports: with
   * {@code compatibility.override_main_response_version} it announces itself as 7.10.2.
   * Elasticsearch reports no distribution, and its major version picks the client: the 9.x client
   * is rejected by an 8.x server, so each major needs its own.
   *
   * @param distribution the {@code version.distribution} field, {@code null} when absent
   * @param versionNumber the {@code version.number} field
   * @return the matching engine type
   * @throws StartupException if the engine is not a supported Elasticsearch or OpenSearch
   */
  public static EngineType fromServerInfo(String distribution, String versionNumber) {
    if (OPENSEARCH_DISTRIBUTION.equalsIgnoreCase(distribution)) {
      return OPENSEARCH;
    }
    if (distribution != null && !distribution.isBlank()) {
      throw new StartupException(
          "Unsupported search engine distribution '"
              + distribution
              + "': only Elasticsearch and OpenSearch are supported");
    }
    int[] version = parseVersion(versionNumber);
    int major = version[0];
    if (major < 8) {
      throw new StartupException(
          "Unsupported Elasticsearch version "
              + versionNumber
              + ": Elasticsearch 8.19 or later is required");
    }
    if (major == 8) {
      if (version[1] < MIN_ELASTICSEARCH_8_MINOR) {
        log.warn(
            "Elasticsearch {} is older than 8.{}, the oldest supported version",
            versionNumber,
            MIN_ELASTICSEARCH_8_MINOR);
      }
      return ELASTICSEARCH_8;
    }
    if (major > 9) {
      log.warn(
          "Elasticsearch {} has not been tested with the platform, using the 9.x client",
          versionNumber);
    }
    return ELASTICSEARCH_9;
  }

  /** Major and minor of a version such as {@code 9.5.1} or {@code 8.19.0-SNAPSHOT}. */
  private static int[] parseVersion(String versionNumber) {
    if (versionNumber == null || versionNumber.isBlank()) {
      throw new StartupException("The search engine did not report its version number");
    }
    String[] parts = versionNumber.trim().split("[.\\-]");
    try {
      int major = Integer.parseInt(parts[0]);
      int minor = parts.length > 1 ? Integer.parseInt(parts[1]) : 0;
      return new int[] {major, minor};
    } catch (NumberFormatException e) {
      throw new StartupException(
          "Unable to read the search engine version number '" + versionNumber + "'", e);
    }
  }
}
