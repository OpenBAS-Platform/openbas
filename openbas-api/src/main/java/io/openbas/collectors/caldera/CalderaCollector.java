package io.openbas.collectors.caldera;

import io.openbas.collectors.caldera.client.CalderaCollectorClient;
import io.openbas.collectors.caldera.config.CalderaCollectorConfig;
import io.openbas.collectors.caldera.service.CalderaCollectorService;
import io.openbas.asset.EndpointService;
import io.openbas.integrations.CollectorService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.stereotype.Service;

import java.time.Duration;

@RequiredArgsConstructor
@Service
public class CalderaCollector {

  private final CalderaCollectorConfig config;
  private final TaskScheduler taskScheduler;
  private final CalderaCollectorClient client;
  private final EndpointService endpointService;
  private final CollectorService collectorService;

  @PostConstruct
  public void init() {
    // If enabled, scheduled every X seconds
    if (this.config.isEnable()) {
      CalderaCollectorService service = new CalderaCollectorService(this.collectorService, this.client, this.config, this.endpointService);
      this.taskScheduler.scheduleAtFixedRate(service, Duration.ofSeconds(this.config.getInterval()));
    }
  }

}
