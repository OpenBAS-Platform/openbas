package io.openbas.executors.caldera.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import io.openbas.asset.EndpointService;
import io.openbas.database.model.Asset;
import io.openbas.database.model.Endpoint;
import io.openbas.database.model.Executor;
import io.openbas.database.specification.EndpointSpecification;
import io.openbas.executors.caldera.client.CalderaExecutorClient;
import io.openbas.executors.caldera.client.model.Ability;
import io.openbas.executors.caldera.config.CalderaExecutorConfig;
import io.openbas.executors.caldera.model.Agent;
import io.openbas.integrations.ExecutorService;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.extern.java.Log;
import org.apache.hc.client5.http.ClientProtocolException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.logging.Level;

import static java.time.Instant.now;
import static java.time.ZoneOffset.UTC;

@Log
@Service
public class CalderaGarbageCollectorService implements Runnable {
    private final int KILL_TTL = 900000; // 15 min
    private final int DELETE_TTL = 1200000; // 20 min

    private final CalderaExecutorClient client;
    private final CalderaExecutorConfig config;

    private final CalderaExecutorContextService calderaExecutorContextService;
    private final EndpointService endpointService;

    public static Endpoint.PLATFORM_TYPE toPlatform(@NotBlank final String platform) {
        return switch (platform) {
            case "linux" -> Endpoint.PLATFORM_TYPE.Linux;
            case "windows" -> Endpoint.PLATFORM_TYPE.Windows;
            case "darwin" -> Endpoint.PLATFORM_TYPE.MacOS;
            default -> throw new IllegalArgumentException("This platform is not supported : " + platform);
        };
    }

    @Autowired
    public CalderaGarbageCollectorService(
            CalderaExecutorClient client,
            CalderaExecutorConfig config,
            CalderaExecutorContextService calderaExecutorContextService,
            EndpointService endpointService
    ) {
        this.client = client;
        this.config = config;
        this.calderaExecutorContextService = calderaExecutorContextService;
        this.endpointService = endpointService;
    }

    @Override
    public void run() {
        List<Endpoint> endpoints = this.endpointService.endpoints(EndpointSpecification.findTemporaryEndpoints());
        endpoints.forEach(endpoint -> {
            if ((now().toEpochMilli() - endpoint.getCreatedAt().toEpochMilli()) > KILL_TTL) {
                client.killAgent(endpoint);
            }
            if((now().toEpochMilli() - endpoint.getCreatedAt().toEpochMilli()) > DELETE_TTL) {
                this.endpointService.deleteEndpoint(endpoint.getId());
                client.deleteAgent(endpoint);
            }
        });
        log.info("Caldera executor garbage collection on " + endpoints.size() + " assets");
    }
}
