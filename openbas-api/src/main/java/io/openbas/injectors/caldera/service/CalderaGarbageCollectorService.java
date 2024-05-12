package io.openbas.injectors.caldera.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import io.openbas.asset.EndpointService;
import io.openbas.database.model.Endpoint;
import io.openbas.database.specification.EndpointSpecification;
import io.openbas.injectors.caldera.client.CalderaInjectorClient;
import io.openbas.injectors.caldera.client.model.Agent;
import io.openbas.injectors.caldera.config.CalderaInjectorConfig;
import io.openbas.utils.Time;
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
import java.util.List;
import java.util.Locale;

import static java.time.Instant.now;
import static java.time.ZoneOffset.UTC;

@Log
@Service
public class CalderaGarbageCollectorService implements Runnable {
    private final int KILL_TTL = 900000; // 15 min
    private final int DELETE_TTL = 1200000; // 20 min

    private final CalderaInjectorClient client;

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
            CalderaInjectorClient client,
            EndpointService endpointService
    ) {
        this.client = client;
        this.endpointService = endpointService;
    }

    @Override
    public void run() {
        List<Endpoint> endpoints = this.endpointService.endpoints(EndpointSpecification.findEndpointsForExecution());
        endpoints.forEach(endpoint -> {
            if ((now().toEpochMilli() - endpoint.getCreatedAt().toEpochMilli()) > KILL_TTL) {
                try {
                    client.killAgent(endpoint);
                } catch (RuntimeException e) {
                    log.info("Failed to kill agent, probably already killed");
                }
            }
            if ((now().toEpochMilli() - endpoint.getCreatedAt().toEpochMilli()) > DELETE_TTL) {
                this.endpointService.deleteEndpoint(endpoint.getId());
                try {
                    client.deleteAgent(endpoint);
                } catch (RuntimeException e) {
                    log.severe("Failed to delete agent");
                }
            }
        });
        try {
            List<Agent> agents = this.client.agents();
            agents.forEach(agent -> {
                if (agent.getExe_name().contains("executor") && (now().toEpochMilli() - Time.toInstant(agent.getCreated()).toEpochMilli()) > KILL_TTL) {
                    try {
                        client.killAgent(agent);
                    } catch (RuntimeException e) {
                        log.info("Failed to kill agent, probably already killed");
                    }
                }
                if (agent.getExe_name().contains("executor") && (now().toEpochMilli() - Time.toInstant(agent.getCreated()).toEpochMilli()) > DELETE_TTL) {
                    try {
                        client.deleteAgent(agent);
                    } catch (RuntimeException e) {
                        log.severe("Failed to delete agent");
                    }
                }
            });
        } catch (RuntimeException e) {
            log.severe("Failed to Caldera agents");
        }
        log.info("Caldera injector garbage collection on " + endpoints.size() + " assets");
    }
}
