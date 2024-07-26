package io.openbas.executors.tanium.service;

import io.openbas.asset.EndpointService;
import io.openbas.database.model.Asset;
import io.openbas.database.model.Endpoint;
import io.openbas.database.model.Executor;
import io.openbas.database.model.Injector;
import io.openbas.executors.tanium.client.TaniumExecutorClient;
import io.openbas.executors.tanium.config.TaniumExecutorConfig;
import io.openbas.executors.tanium.model.NodeEndpoint;
import io.openbas.executors.tanium.model.TaniumEndpoint;
import io.openbas.integrations.ExecutorService;
import io.openbas.integrations.InjectorService;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.logging.Level;

import static java.time.Instant.now;
import static java.time.ZoneOffset.UTC;

@ConditionalOnProperty(prefix = "executor.tanium", name = "enable")
@Log
@Service
public class TaniumExecutorService implements Runnable {
    private static final int CLEAR_TTL = 1800000; // 30 minutes
    private static final int DELETE_TTL = 86400000; // 24 hours
    private static final String TANIUM_EXECUTOR_TYPE = "openbas_tanium";
    private static final String TANIUM_EXECUTOR_NAME = "Tanium";

    private final TaniumExecutorClient client;

    private final EndpointService endpointService;

    private final TaniumExecutorContextService taniumExecutorContextService;

    private final InjectorService injectorService;

    private Executor executor = null;

    public static Endpoint.PLATFORM_TYPE toPlatform(@NotBlank final String platform) {
        return switch (platform) {
            case "Linux" -> Endpoint.PLATFORM_TYPE.Linux;
            case "Windows" -> Endpoint.PLATFORM_TYPE.Windows;
            case "MacOS" -> Endpoint.PLATFORM_TYPE.MacOS;
            default -> Endpoint.PLATFORM_TYPE.Unknown;
        };
    }

    public static Endpoint.PLATFORM_ARCH toArch(@NotBlank final String arch) {
        return switch (arch) {
            case "x64-based PC", "x86_64" -> Endpoint.PLATFORM_ARCH.x86_64;
            case "arm64-based PC", "arm64" -> Endpoint.PLATFORM_ARCH.arm64;
            default -> Endpoint.PLATFORM_ARCH.Unknown;
        };
    }

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
            if (config.isEnable()) {
                this.executor = executorService.register(config.getId(), TANIUM_EXECUTOR_TYPE, TANIUM_EXECUTOR_NAME, getClass().getResourceAsStream("/img/icon-tanium.png"), new String[]{Endpoint.PLATFORM_TYPE.Windows.name(), Endpoint.PLATFORM_TYPE.Linux.name(), Endpoint.PLATFORM_TYPE.MacOS.name()});
            } else {
                executorService.remove(config.getId());
            }
        } catch (Exception e) {
            log.log(Level.SEVERE, "Error creating Tanium executor: " + e);
        }
    }

    @Override
    public void run() {
        log.info("Running Tanium executor endpoints gathering...");
        List<NodeEndpoint> nodeEndpoints = this.client.endpoints().getData().getEndpoints().getEdges().stream().toList();
        List<Endpoint> endpoints = toEndpoint(nodeEndpoints).stream().filter(Asset::getActive).toList();
        log.info("Tanium executor provisioning based on " + endpoints.size() + " assets");
        endpoints.forEach(endpoint -> {
            List<Endpoint> existingEndpoints = this.endpointService.findAssetsForInjectionByHostname(endpoint.getHostname()).stream().filter(endpoint1 -> Arrays.stream(endpoint1.getIps()).anyMatch(s -> Arrays.stream(endpoint.getIps()).toList().contains(s))).toList();
            if (existingEndpoints.isEmpty()) {
                Optional<Endpoint> endpointByExternalReference = endpointService.findByExternalReference(endpoint.getExternalReference());
                if (endpointByExternalReference.isPresent()) {
                    this.updateEndpoint(endpoint, List.of(endpointByExternalReference.get()));
                } else {
                    this.endpointService.createEndpoint(endpoint);
                }
            } else {
                this.updateEndpoint(endpoint, existingEndpoints);
            }
        });
        List<Endpoint> inactiveEndpoints = toEndpoint(nodeEndpoints).stream().filter(endpoint -> !endpoint.getActive()).toList();
        inactiveEndpoints.forEach(endpoint -> {
            Optional<Endpoint> optionalExistingEndpoint = this.endpointService.findByExternalReference(endpoint.getExternalReference());
            if (optionalExistingEndpoint.isPresent()) {
                Endpoint existingEndpoint = optionalExistingEndpoint.get();
                if ((now().toEpochMilli() - existingEndpoint.getClearedAt().toEpochMilli()) > DELETE_TTL) {
                    log.info("Found stale endpoint " + existingEndpoint.getName() + ", deleting it...");
                    this.endpointService.deleteEndpoint(existingEndpoint.getId());
                }
            }
        });
    }

    // -- PRIVATE --

    private List<Endpoint> toEndpoint(@NotNull final List<NodeEndpoint> nodeEndpoints) {
        return nodeEndpoints.stream()
                .map((nodeEndpoint) -> {
                    TaniumEndpoint taniumEndpoint = nodeEndpoint.getNode();
                    Endpoint endpoint = new Endpoint();
                    endpoint.setExecutor(this.executor);
                    endpoint.setExternalReference(taniumEndpoint.getId());
                    endpoint.setName(taniumEndpoint.getName());
                    endpoint.setDescription("Asset collected by Tanium executor context.");
                    endpoint.setIps(taniumEndpoint.getIpAddresses());
                    endpoint.setHostname(taniumEndpoint.getName());
                    endpoint.setPlatform(toPlatform(taniumEndpoint.getOs().getPlatform()));
                    endpoint.setArch(toArch(taniumEndpoint.getProcessor().getArchitecture()));
                    endpoint.setLastSeen(toInstant(taniumEndpoint.getEidLastSeen()));
                    return endpoint;
                })
                .toList();
    }

    private void updateEndpoint(@NotNull final Endpoint external, @NotNull final List<Endpoint> existingList) {
        Endpoint matchingExistingEndpoint = existingList.getFirst();
        matchingExistingEndpoint.setLastSeen(external.getLastSeen());
        matchingExistingEndpoint.setName(external.getName());
        matchingExistingEndpoint.setIps(external.getIps());
        matchingExistingEndpoint.setHostname(external.getHostname());
        matchingExistingEndpoint.setExternalReference(external.getExternalReference());
        matchingExistingEndpoint.setPlatform(external.getPlatform());
        matchingExistingEndpoint.setArch(external.getArch());
        matchingExistingEndpoint.setExecutor(this.executor);
        if ((now().toEpochMilli() - matchingExistingEndpoint.getClearedAt().toEpochMilli()) > CLEAR_TTL) {
            try {
                log.info("Clearing endpoint " + matchingExistingEndpoint.getHostname());
                Iterable<Injector> injectors = injectorService.injectors();
                injectors.forEach(injector -> {
                    if (injector.getExecutorClearCommands() != null) {
                        this.taniumExecutorContextService.launchExecutorClear(injector, matchingExistingEndpoint);
                    }
                });
                matchingExistingEndpoint.setClearedAt(now());
            } catch (RuntimeException e) {
                log.info("Failed clear agents");
            }
        }
        this.endpointService.updateEndpoint(matchingExistingEndpoint);
    }

    private Instant toInstant(@NotNull final String lastSeen) {
        String pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'";
        DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern(pattern, Locale.getDefault());
        LocalDateTime localDateTime = LocalDateTime.parse(lastSeen, dateTimeFormatter);
        ZonedDateTime zonedDateTime = localDateTime.atZone(UTC);
        return zonedDateTime.toInstant();
    }
}
