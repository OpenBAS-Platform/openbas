package io.openbas.injectors.caldera;

import io.openbas.database.repository.InjectRepository;
import io.openbas.database.repository.InjectStatusRepository;
import io.openbas.injectors.caldera.config.CalderaInjectorConfig;
import io.openbas.injectors.caldera.service.CalderaInjectorService;
import io.openbas.injectors.caldera.service.CalderaResultCollectorService;
import io.openbas.rest.inject.service.InjectStatusService;
import jakarta.annotation.PostConstruct;
import java.time.Duration;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.stereotype.Service;

@ConditionalOnProperty(prefix = "executor.caldera", name = "enable")
@RequiredArgsConstructor
@Service
public class CalderaResultCollector {

  private final CalderaInjectorConfig config;
  private final ThreadPoolTaskScheduler taskScheduler;
  private final InjectRepository injectRepository;
  private final InjectStatusRepository injectStatusRepository;
  private final CalderaInjectorService calderaService;
  private final InjectStatusService injectStatusService;

  @PostConstruct
  public void init() {
    // If enabled, scheduled every X seconds
    if (this.config.isEnable()) {
      CalderaResultCollectorService service =
          new CalderaResultCollectorService(
              this.injectRepository,
              this.injectStatusRepository,
              this.calderaService,
              this.injectStatusService);
      this.taskScheduler.scheduleAtFixedRate(service, Duration.ofSeconds(60));
    }
  }
}
