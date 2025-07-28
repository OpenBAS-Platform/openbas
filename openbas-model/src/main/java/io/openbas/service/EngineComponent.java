package io.openbas.service;

import io.openbas.config.EngineConfig;
import io.openbas.database.repository.IndexingStatusRepository;
import io.openbas.driver.ElasticDriver;
import io.openbas.driver.OpenSearchDriver;
import io.openbas.engine.EngineContext;
import io.openbas.engine.EngineService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EngineComponent {
  private final EngineConfig config;
  private final EngineContext searchEngine;
  private final OpenSearchDriver openSearchDriver;
  private final ElasticDriver elasticDriver;
  private final IndexingStatusRepository indexingStatusRepository;
  private final CommonSearchService commonSearchService;

  @Bean
  public EngineService engine() throws Exception {
    if (config.getEngineSelector().equalsIgnoreCase("elk")) {
      return new ElasticService(
          searchEngine, elasticDriver, indexingStatusRepository, config, commonSearchService);
    }
    if (config.getEngineSelector().equalsIgnoreCase("opensearch")) {
      return new OpenSearchService(
          searchEngine, openSearchDriver, indexingStatusRepository, config, commonSearchService);
    }
    throw new IllegalStateException("engine selector not supported");
  }
}
