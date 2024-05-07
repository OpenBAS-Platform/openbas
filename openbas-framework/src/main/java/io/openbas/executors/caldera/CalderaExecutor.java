package io.openbas.executors.caldera;

import io.openbas.executors.caldera.client.CalderaExecutorClient;
import io.openbas.executors.caldera.config.CalderaExecutorConfig;
import io.openbas.executors.caldera.service.CalderaExecutorService;
import io.openbas.asset.EndpointService;
import io.openbas.integrations.ExecutorService;
import io.openbas.integrations.InjectorService;
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
    private final CalderaExecutorClient client;
    private final EndpointService endpointService;
    private final ExecutorService executorService;
    private final InjectorService injectorService;

    @PostConstruct
    public void init() {
        // If enabled, scheduled every X seconds
        if (this.config.isEnable()) {
            CalderaExecutorService service = new CalderaExecutorService(this.executorService, this.client, this.config, this.endpointService, this.injectorService);
            this.taskScheduler.scheduleAtFixedRate(service, Duration.ofSeconds(5));
        }
    }
}
