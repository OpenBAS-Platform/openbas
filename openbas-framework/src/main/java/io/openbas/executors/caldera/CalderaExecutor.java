package io.openbas.executors.caldera;

import io.openbas.asset.EndpointService;
import io.openbas.executors.caldera.client.CalderaExecutorClient;
import io.openbas.executors.caldera.config.CalderaExecutorConfig;
import io.openbas.executors.caldera.service.CalderaExecutorContextService;
import io.openbas.executors.caldera.service.CalderaExecutorService;
import io.openbas.integrations.ExecutorService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.stereotype.Service;

import java.time.Duration;

@ConditionalOnProperty(prefix = "executor.caldera", name = "enable")
@RequiredArgsConstructor
@Service
public class CalderaExecutor {

    private final CalderaExecutorConfig config;
    private final TaskScheduler taskScheduler;
    private final CalderaExecutorClient client;
    private final EndpointService endpointService;
    private final CalderaExecutorContextService calderaExecutorContextService;
    private final ExecutorService executorService;

    @PostConstruct
    public void init() {
        // If enabled, scheduled every X seconds
        if (this.config.isEnable()) {
            CalderaExecutorService service = new CalderaExecutorService(this.executorService, this.client, this.config, this.calderaExecutorContextService, this.endpointService);
            this.taskScheduler.scheduleAtFixedRate(service, Duration.ofSeconds(5));
        }
    }
}
