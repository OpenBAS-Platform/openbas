package io.openbas.executors.tanium;

import io.openbas.asset.EndpointService;
import io.openbas.executors.tanium.client.TaniumExecutorClient;
import io.openbas.executors.tanium.config.TaniumExecutorConfig;
import io.openbas.executors.tanium.service.TaniumExecutorContextService;
import io.openbas.executors.tanium.service.TaniumExecutorService;
import io.openbas.integrations.ExecutorService;
import io.openbas.integrations.InjectorService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.stereotype.Service;

import java.time.Duration;

@RequiredArgsConstructor
@Service
public class TaniumExecutor {

    private final TaniumExecutorConfig config;
    private final ThreadPoolTaskScheduler taskScheduler;
    private final TaniumExecutorClient client;
    private final EndpointService endpointService;
    private final TaniumExecutorContextService taniumExecutorContextService;
    private final ExecutorService executorService;
    private final InjectorService injectorService;

    @PostConstruct
    public void init() {
        TaniumExecutorService service = new TaniumExecutorService(this.executorService, this.client, this.config, this.taniumExecutorContextService, this.endpointService, this.injectorService);
        if (this.config.isEnable()) {
            this.taskScheduler.scheduleAtFixedRate(service, Duration.ofSeconds(60));
        }
    }
}
