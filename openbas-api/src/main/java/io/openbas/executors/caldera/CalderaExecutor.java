package io.openbas.executors.caldera;

import io.openbas.executors.caldera.client.CalderaCollectorClient;
import io.openbas.executors.caldera.config.CalderaExecutorConfig;
import io.openbas.executors.caldera.service.CalderaExecutorService;
import io.openbas.asset.EndpointService;
import io.openbas.integrations.CollectorService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.stereotype.Service;

import java.time.Duration;

@RequiredArgsConstructor
@Service
public class CalderaExecutor {

  private final CalderaExecutorConfig config;
  private final TaskScheduler taskScheduler;
  private final CalderaCollectorClient client;
  private final EndpointService endpointService;
  private final CollectorService collectorService;

  @PostConstruct
  public void init() {
    // If enabled, scheduled every X seconds
    if (this.config.isEnable()) {
      CalderaExecutorService service = new CalderaExecutorService(this.collectorService, this.client, this.config, this.endpointService);
      this.taskScheduler.scheduleAtFixedRate(service, Duration.ofSeconds(this.config.getInterval()));
    }
  }

}
