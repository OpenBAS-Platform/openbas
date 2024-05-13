package io.openbas.executors.tanium.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import io.openbas.asset.EndpointService;
import io.openbas.database.model.Endpoint;
import io.openbas.database.model.Executor;
import io.openbas.executors.tanium.client.TaniumExecutorClient;
import io.openbas.executors.tanium.config.TaniumExecutorConfig;
import io.openbas.integrations.ExecutorService;
import io.openbas.integrations.InjectorService;
import lombok.extern.java.Log;
import org.apache.hc.client5.http.ClientProtocolException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.logging.Level;

@ConditionalOnProperty(prefix = "executor.tanium", name = "enable")
@Log
@Service
public class TaniumExecutorService implements Runnable {
    private static final String TANIUM_EXECUTOR_TYPE = "openbas_tanium";
    private static final String TANIUM_EXECUTOR_NAME = "Tanium";

    private final TaniumExecutorClient client;

    private final EndpointService endpointService;

    private final TaniumExecutorContextService taniumExecutorContextService;

    private final InjectorService injectorService;

    private Executor executor = null;

    @Autowired
    public TaniumExecutorService(
            ExecutorService executorService,
            TaniumExecutorClient client,
            TaniumExecutorConfig config,
            TaniumExecutorContextService taniumExecutorContextService,
            EndpointService endpointService,
            InjectorService injectorService
    ) {
        this.client = client;
        this.endpointService = endpointService;
        this.taniumExecutorContextService = taniumExecutorContextService;
        this.injectorService = injectorService;
        try {
            this.executor = executorService.register(config.getId(), TANIUM_EXECUTOR_TYPE, TANIUM_EXECUTOR_NAME, getClass().getResourceAsStream("/img/icon-tanium.png"), new String[]{Endpoint.PLATFORM_TYPE.Windows.name(), Endpoint.PLATFORM_TYPE.Linux.name(), Endpoint.PLATFORM_TYPE.MacOS.name()});
        } catch (Exception e) {
            log.log(Level.SEVERE, "Error creating Tanium executor: " + e);
        }
    }

    @Override
    public void run() {
        log.info("Running Tanium executor endpoints gathering...");
        try {
            List<io.openbas.executors.tanium.model.Endpoint> endpoints = this.client.endpoints().stream().toList();
            System.out.println(endpoints);
        } catch (ClientProtocolException | JsonProcessingException e) {
            log.log(Level.SEVERE, "Error running Tanium service " + e.getMessage(), e);
        }
    }
}
