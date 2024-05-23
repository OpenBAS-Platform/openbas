package io.openbas.collectors.sentinel;

import io.openbas.collectors.sentinel.config.CollectorSentinelConfig;
import io.openbas.collectors.sentinel.service.LogAnalyticsService;
import io.openbas.integrations.CollectorService;
import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.logging.Level;

@Service
@ConditionalOnProperty(prefix = "collector.sentinel", name = "enable")
@Log
public class SentinelJob implements Runnable {
  private static final String SENTINEL_COLLECTOR_TYPE = "openbas_microsoft_sentinel";
  private static final String SENTINEL_COLLECTOR_NAME = "Microsoft Sentinel";
  private final LogAnalyticsService logAnalyticsService;

  @Autowired
  public SentinelJob(CollectorService collectorService, CollectorSentinelConfig config, LogAnalyticsService logAnalyticsService) {
    this.logAnalyticsService = logAnalyticsService;
    try {
      collectorService.register(config.getId(), SENTINEL_COLLECTOR_TYPE, SENTINEL_COLLECTOR_NAME, getClass().getResourceAsStream("/img/icon-sentinel.png"));
    } catch (Exception e) {
      log.log(Level.SEVERE, "Error creating sentinel collector");
    }
  }

  @Override
  public void run() {
    // Detection & Prevention
    try {
      this.logAnalyticsService.computeExpectations();
    } catch (Exception e) {
      log.log(Level.SEVERE, "Error running log analytics service");
    }
  }

}
