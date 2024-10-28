package io.openbas.injectors.caldera;

import io.openbas.asset.EndpointService;
import io.openbas.injectors.caldera.client.CalderaInjectorClient;
import io.openbas.injectors.caldera.config.CalderaInjectorConfig;
import io.openbas.injectors.caldera.service.CalderaGarbageCollectorService;
import jakarta.annotation.PostConstruct;
import java.time.Duration;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.stereotype.Service;

@ConditionalOnProperty(prefix = "executor.caldera", name = "enable")
@RequiredArgsConstructor
@Service
public class CalderaGarbageCollector {

  private final CalderaInjectorConfig config;
  private final ThreadPoolTaskScheduler taskScheduler;
  private final CalderaInjectorClient client;
  private final EndpointService endpointService;

  @PostConstruct
  public void init() {
    // If enabled, scheduled every X seconds
    if (this.config.isEnable()) {
      CalderaGarbageCollectorService service =
          new CalderaGarbageCollectorService(this.client, this.endpointService);
      this.taskScheduler.scheduleAtFixedRate(service, Duration.ofSeconds(120));
    }
  }
}
