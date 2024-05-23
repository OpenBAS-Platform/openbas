package io.openbas.collectors.sentinel;

import io.openbas.collectors.sentinel.config.CollectorSentinelConfig;
import io.openbas.collectors.sentinel.service.LogAnalyticsService;
import io.openbas.integrations.CollectorService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.stereotype.Service;

import java.time.Duration;

@RequiredArgsConstructor
@Service
@ConditionalOnProperty(prefix = "collector.sentinel", name = "enable")
public class SentinelCollector {

  private final CollectorSentinelConfig config;
  private final ThreadPoolTaskScheduler taskScheduler;
  private final LogAnalyticsService logAnalyticsService;
  private final CollectorService collectorService;

  @PostConstruct
  public void init() {
    // If enabled, scheduled every X seconds
    if (this.config.isEnable()) {
      SentinelJob job = new SentinelJob(this.collectorService, this.config, this.logAnalyticsService);
      this.taskScheduler.scheduleAtFixedRate(job, Duration.ofSeconds(this.config.getInterval()));
    }
  }

}
