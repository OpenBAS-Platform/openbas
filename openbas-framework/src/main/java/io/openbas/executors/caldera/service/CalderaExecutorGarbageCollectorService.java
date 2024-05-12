package io.openbas.executors.caldera.service;

import io.openbas.asset.EndpointService;
import io.openbas.database.model.Endpoint;
import io.openbas.database.specification.EndpointSpecification;
import io.openbas.executors.caldera.client.CalderaExecutorClient;
import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.List;

import static java.time.Instant.now;

@ConditionalOnProperty(prefix = "executor.caldera", name = "enable")
@Log
@Service
public class CalderaExecutorGarbageCollectorService implements Runnable {
    private final int CLEAR_TTL = 1200000; // 20 min

    private final CalderaExecutorClient client;
    private final EndpointService endpointService;
    private final CalderaExecutorContextService calderaExecutorContextService;

    @Autowired
    public CalderaExecutorGarbageCollectorService(
            CalderaExecutorClient client,
            EndpointService endpointService,
            CalderaExecutorContextService calderaExecutorContextService
    ) {
        this.client = client;
        this.endpointService = endpointService;
        this.calderaExecutorContextService = calderaExecutorContextService;
    }

    @Override
    public void run() {
        List<Endpoint> endpoints = this.endpointService.endpoints(EndpointSpecification.findEndpointsForInjection());
        endpoints.forEach(endpoint -> {
            if ((now().toEpochMilli() - endpoint.getUpdatedAt().toEpochMilli()) > CLEAR_TTL) {
                try {
                    log.info("Clearing endpoint " + endpoint.getHostname());
                    client.exploit("base64", endpoint.getExternalReference(), this.calderaExecutorContextService.getInjectorExecutorClearAbilities().get(endpoint.getExecutor().getId()).getAbility_id());
                } catch (RuntimeException e) {
                    log.info("Failed clear agents");
                }
            }
        });
    }
}
