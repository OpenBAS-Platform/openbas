package io.openaev.engine;

import io.openaev.config.EngineConfig;
import io.openaev.database.repository.IndexingStatusRepository;
import io.openaev.engine.facade.EngineService;
import io.openaev.engine.impl.elasticsearch.es8.ElasticDriver;
import io.openaev.engine.impl.elasticsearch.es8.ElasticService;
import io.openaev.engine.impl.opensearch.os3.OpenSearchDriver;
import io.openaev.engine.impl.opensearch.os3.OpenSearchService;
import io.openaev.service.CommonSearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

/**
 * Factory component for creating the appropriate search engine service.
 *
 * <p>The engine is never configured: this component asks the server behind {@code engine.url} what
 * it is (see {@link EngineVersionProbe}) and instantiates the matching implementation, an
 * Elasticsearch 8 or 9 {@link ElasticService} or an {@link OpenSearchService}. The created service
 * is registered as a Spring bean.
 *
 * @see EngineType
 * @see EngineVersionProbe
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EngineComponent {

  /** Property that used to select the engine by hand, now ignored. */
  static final String LEGACY_SELECTOR_PROPERTY = "engine.engine-selector";

  private final EngineConfig config;
  private final EngineContext searchEngine;
  private final OpenSearchDriver openSearchDriver;
  private final ElasticDriver elasticDriver8;
  private final io.openaev.engine.impl.elasticsearch.es9.ElasticDriver elasticDriver9;
  private final IndexingStatusRepository indexingStatusRepository;
  private final CommonSearchService commonSearchService;
  private final EngineVersionProbe engineVersionProbe;
  private final Environment environment;

  /**
   * Creates the search engine service matching the server behind {@code engine.url}.
   *
   * @return the {@link EngineService} implementation for the detected engine
   * @throws Exception if there is an issue during engine initialization
   * @throws io.openaev.exception.StartupException if the engine cannot be detected or is not
   *     supported
   */
  @Bean
  public EngineService engine() throws Exception {
    return switch (detectEngineType()) {
      case ELASTICSEARCH_8 ->
          new ElasticService(
              searchEngine, elasticDriver8, indexingStatusRepository, config, commonSearchService);
      case ELASTICSEARCH_9 ->
          new io.openaev.engine.impl.elasticsearch.es9.ElasticService(
              searchEngine, elasticDriver9, indexingStatusRepository, config, commonSearchService);
      case OPENSEARCH ->
          new OpenSearchService(
              searchEngine,
              openSearchDriver,
              indexingStatusRepository,
              config,
              commonSearchService);
    };
  }

  /**
   * Detects which engine the platform talks to.
   *
   * <p>AWS SigV4 modes are not probed: requests need signing, {@code engine.url} is not used there,
   * and the only engine the platform drives on AWS is OpenSearch.
   *
   * @return the detected engine type
   */
  EngineType detectEngineType() {
    if (environment.containsProperty(LEGACY_SELECTOR_PROPERTY)) {
      log.warn(
          "{} is deprecated and ignored: the search engine is now detected automatically",
          LEGACY_SELECTOR_PROPERTY);
    }
    if (!"no".equalsIgnoreCase(config.getEngineAwsMode())) {
      log.info(
          "Engine AWS mode '{}': using the OpenSearch client for {}",
          config.getEngineAwsMode(),
          config.getEngineAwsHost());
      return EngineType.OPENSEARCH;
    }
    EngineVersionProbe.ServerInfo info = engineVersionProbe.detect();
    EngineType type = EngineType.fromServerInfo(info.distribution(), info.number(), info.tagline());
    log.info(
        "Engine auto-detected: {} {} at {} -> {} client",
        type == EngineType.OPENSEARCH ? "OpenSearch" : "Elasticsearch",
        info.number(),
        config.getUrl(),
        type);
    return type;
  }
}
