package io.openbas.executors.caldera;

import io.openbas.asset.EndpointService;
import io.openbas.executors.caldera.client.CalderaExecutorClient;
import io.openbas.executors.caldera.config.CalderaExecutorConfig;
import io.openbas.executors.caldera.service.CalderaExecutorContextService;
import io.openbas.executors.caldera.service.CalderaExecutorService;
import io.openbas.executors.caldera.service.CalderaGarbageCollectorService;
import io.openbas.integrations.ExecutorService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.stereotype.Service;

import java.time.Duration;

@RequiredArgsConstructor
@Service
public class CalderaGarbageCollector {

    private final CalderaExecutorConfig config;
    private final TaskScheduler taskScheduler;
    private final CalderaExecutorClient client;
    private final EndpointService endpointService;
    private final CalderaExecutorContextService calderaExecutorContextService;

    @PostConstruct
    public void init() {
        // If enabled, scheduled every X seconds
        if (this.config.isEnable()) {
            CalderaGarbageCollectorService service = new CalderaGarbageCollectorService(this.client, this.config, this.calderaExecutorContextService, this.endpointService);
            this.taskScheduler.scheduleAtFixedRate(service, Duration.ofSeconds(60));
        }
    }
}
