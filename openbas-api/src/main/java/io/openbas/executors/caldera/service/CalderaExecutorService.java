package io.openbas.executors.caldera.service;

import io.openbas.asset.EndpointService;
import io.openbas.database.model.*;
import io.openbas.executors.caldera.client.CalderaExecutorClient;
import io.openbas.executors.caldera.config.CalderaExecutorConfig;
import io.openbas.executors.caldera.model.Agent;
import io.openbas.integrations.ExecutorService;
import io.openbas.integrations.InjectorService;
import io.openbas.service.PlatformSettingsService;
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
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.logging.Level;

import static java.time.Instant.now;
import static java.time.ZoneOffset.UTC;

@ConditionalOnProperty(prefix = "executor.caldera", name = "enable")
@Log
@Service
public class CalderaExecutorService implements Runnable {

    private static final int CLEAR_TTL = 1800000; // 30 minutes
    private static final int DELETE_TTL = 86400000; // 24 hours
    private static final String CALDERA_EXECUTOR_TYPE = "openbas_caldera";
    private static final String CALDERA_EXECUTOR_NAME = "Caldera";

    private final CalderaExecutorClient client;

    private final EndpointService endpointService;

    private final CalderaExecutorContextService calderaExecutorContextService;

    private final InjectorService injectorService;
    private final PlatformSettingsService platformSettingsService;

    private Executor executor = null;

    public static Endpoint.PLATFORM_TYPE toPlatform(@NotBlank final String platform) {
        return switch (platform) {
            case "linux" -> Endpoint.PLATFORM_TYPE.Linux;
            case "windows" -> Endpoint.PLATFORM_TYPE.Windows;
            case "darwin" -> Endpoint.PLATFORM_TYPE.MacOS;
            default -> throw new IllegalArgumentException("This platform is not supported : " + platform);
        };
    }

    public static Endpoint.PLATFORM_ARCH toArch(@NotBlank final String arch) {
        return switch (arch) {
            case "amd64" -> Endpoint.PLATFORM_ARCH.x86_64;
            case "arm64" -> Endpoint.PLATFORM_ARCH.arm64;
            default -> throw new IllegalArgumentException("This arch is not supported : " + arch);
        };
    }

    @Autowired
    public CalderaExecutorService(
            ExecutorService executorService,
            CalderaExecutorClient client,
            CalderaExecutorConfig config,
            CalderaExecutorContextService calderaExecutorContextService,
            EndpointService endpointService,
            InjectorService injectorService,
            PlatformSettingsService platformSettingsService) {
        this.client = client;
        this.endpointService = endpointService;
        this.calderaExecutorContextService = calderaExecutorContextService;
        this.injectorService = injectorService;
        this.platformSettingsService = platformSettingsService;
        try {
            if (config.isEnable()) {
                this.executor = executorService.register(config.getId(), CALDERA_EXECUTOR_TYPE, CALDERA_EXECUTOR_NAME, getClass().getResourceAsStream("/img/icon-caldera.png"), new String[]{Endpoint.PLATFORM_TYPE.Windows.name(), Endpoint.PLATFORM_TYPE.Linux.name(), Endpoint.PLATFORM_TYPE.MacOS.name()});
                this.calderaExecutorContextService.registerAbilities();
            } else {
                executorService.remove(config.getId());
                this.platformSettingsService.cleanMessage(BannerMessage.BANNER_KEYS.CALDERA_UNAVAILABLE);
            }
        } catch (Exception e) {
            log.log(Level.SEVERE, "Error creating caldera executor: " + e);
        }
    }

    @Override
    public void run() {
        try {
            log.info("Running Caldera executor endpoints gathering...");
            // The executor only retrieve "main" agents (without the keyword "executor")
            // This is NOT a standard behaviour, this is because we are using Caldera as an executor and we should not
            // Will be replaced by the XTM agent
            List<Agent> agents = this.client.agents().stream().filter(agent -> !agent.getExe_name().contains("implant")).toList();
            List<Endpoint> endpoints = toEndpoint(agents).stream().filter(Asset::getActive).toList();
            log.info("Caldera executor provisioning based on " + endpoints.size() + " assets");
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
            List<Endpoint> inactiveEndpoints = toEndpoint(agents).stream().filter(endpoint -> !endpoint.getActive()).toList();
            inactiveEndpoints.forEach(endpoint -> {
                Optional<Endpoint> optionalExistingEndpoint = this.endpointService.findByExternalReference(endpoint.getExternalReference());
                if (optionalExistingEndpoint.isPresent()) {
                    Endpoint existingEndpoint = optionalExistingEndpoint.get();
                    if ((now().toEpochMilli() - existingEndpoint.getClearedAt().toEpochMilli()) > DELETE_TTL) {
                        log.info("Found stale agent " + existingEndpoint.getName() + ", deleting it...");
                        this.client.deleteAgent(existingEndpoint);
                        this.endpointService.deleteEndpoint(existingEndpoint.getId());
                    }
                }
            });
            this.platformSettingsService.cleanMessage(BannerMessage.BANNER_KEYS.CALDERA_UNAVAILABLE);
        } catch (Exception e) {
            this.platformSettingsService.errorMessage(BannerMessage.BANNER_KEYS.CALDERA_UNAVAILABLE);
        }
    }

    // -- PRIVATE --

    private List<Endpoint> toEndpoint(@NotNull final List<Agent> agents) {
        return agents.stream()
                .map((agent) -> {
                    Endpoint endpoint = new Endpoint();
                    endpoint.setExecutor(this.executor);
                    endpoint.setExternalReference(agent.getPaw());
                    endpoint.setName(agent.getHost());
                    endpoint.setDescription("Asset collected by Caldera executor context.");
                    endpoint.setIps(agent.getHost_ip_addrs());
                    endpoint.setHostname(agent.getHost());
                    endpoint.setPlatform(toPlatform(agent.getPlatform()));
                    endpoint.setArch(toArch(agent.getArchitecture()));
                    endpoint.setProcessName(agent.getExe_name());
                    endpoint.setLastSeen(toInstant(agent.getLast_seen()));
                    return endpoint;
                })
                .toList();
    }

    private void updateEndpoint(@NotNull final Endpoint external, @NotNull final List<Endpoint> existingList) {
        Endpoint matchingExistingEndpoint = existingList.getFirst();
        matchingExistingEndpoint.setLastSeen(external.getLastSeen());
        matchingExistingEndpoint.setExternalReference(external.getExternalReference());
        matchingExistingEndpoint.setName(external.getName());
        matchingExistingEndpoint.setIps(external.getIps());
        matchingExistingEndpoint.setHostname(external.getHostname());
        matchingExistingEndpoint.setProcessName(external.getProcessName());
        matchingExistingEndpoint.setPlatform(external.getPlatform());
        matchingExistingEndpoint.setArch(external.getArch());
        matchingExistingEndpoint.setExecutor(this.executor);
        if ((now().toEpochMilli() - matchingExistingEndpoint.getClearedAt().toEpochMilli()) > CLEAR_TTL) {
            try {
                log.info("Clearing endpoint " + matchingExistingEndpoint.getHostname());
                Iterable<Injector> injectors = injectorService.injectors();
                injectors.forEach(injector -> {
                    if (injector.getExecutorClearCommands() != null) {
                        this.calderaExecutorContextService.launchExecutorClear(injector, matchingExistingEndpoint);
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
