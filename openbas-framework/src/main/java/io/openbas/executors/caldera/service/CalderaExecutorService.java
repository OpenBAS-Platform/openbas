package io.openbas.executors.caldera.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.asset.EndpointService;
import io.openbas.database.model.Asset;
import io.openbas.database.model.Endpoint;
import io.openbas.database.model.Executor;
import io.openbas.database.model.Injector;
import io.openbas.executors.caldera.client.CalderaExecutorClient;
import io.openbas.executors.caldera.client.model.Ability;
import io.openbas.executors.caldera.config.CalderaExecutorConfig;
import io.openbas.executors.caldera.model.Agent;
import io.openbas.integrations.ExecutorService;
import io.openbas.integrations.InjectorService;
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
import java.util.*;
import java.util.logging.Level;

import static java.time.ZoneOffset.UTC;

@Log
@Service
public class CalderaExecutorService implements Runnable {

    private static final String CALDERA_EXECUTOR_TYPE = "openbas_caldera";
    private static final String CALDERA_EXECUTOR_NAME = "Caldera";

    private final CalderaExecutorClient client;
    private final CalderaExecutorConfig config;

    private final ExecutorService executorService;
    private final EndpointService endpointService;
    private final InjectorService injectorService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private Executor executor = null;
    private Map<String, Ability> injectorExecutorAbilities = new HashMap<>();

    public static Endpoint.PLATFORM_TYPE toPlatform(@NotBlank final String platform) {
        return switch (platform) {
            case "linux" -> Endpoint.PLATFORM_TYPE.Linux;
            case "windows" -> Endpoint.PLATFORM_TYPE.Windows;
            case "darwin" -> Endpoint.PLATFORM_TYPE.MacOS;
            default -> throw new IllegalArgumentException("This platform is not supported : " + platform);
        };
    }

    @Autowired
    public CalderaExecutorService(ExecutorService executorService, CalderaExecutorClient client,
                                  CalderaExecutorConfig config, EndpointService endpointService, InjectorService injectorService) {
        this.client = client;
        this.config = config;
        this.executorService = executorService;
        this.endpointService = endpointService;
        this.injectorService = injectorService;
        try {
            // Create the abilities if not exist for all injectors that need it
            List<Ability> abilities = this.abilities();
            Iterable<Injector> injectors = injectorService.injectors();
            injectors.forEach(injector -> {
                if (injector.getExecutorCommands() != null) {
                    List<Ability> filteredAbilities = abilities.stream().filter(ability -> ability.getName().equals("caldera-subprocessor-" + injector.getName())).toList();
                    if (!filteredAbilities.isEmpty()) {
                        Ability existingAbility = filteredAbilities.getFirst();
                        client.deleteAbility(existingAbility);
                    }
                    Ability ability = client.createAbility(injector);
                    this.injectorExecutorAbilities.put(injector.getId(), ability);
                }
            });
            this.executor = executorService.register(this.config.getId(), CALDERA_EXECUTOR_TYPE, CALDERA_EXECUTOR_NAME, getClass().getResourceAsStream("/img/icon-caldera.png"), new String[]{Endpoint.PLATFORM_TYPE.Windows.name(), Endpoint.PLATFORM_TYPE.Linux.name(), Endpoint.PLATFORM_TYPE.MacOS.name()});
        } catch (Exception e) {
            log.log(Level.SEVERE, "Error creating caldera executor: " + e);
        }
    }

    @Override
    public void run() {
        try {
            List<Agent> agents = this.client.agents();
            List<Endpoint> endpoints = toEndpoint(agents).stream().filter(Asset::getActive).toList();
            endpoints.forEach(endpoint -> {
                List<Endpoint> existingEndpoints = this.endpointService.findByHostname(endpoint.getHostname()).stream()
                        .filter(endpoint1 -> Arrays.stream(endpoint1.getIps()).anyMatch(s -> Arrays.stream(endpoint.getIps()).toList().contains(s)))
                        .toList();
                if (existingEndpoints.isEmpty()) {
                    this.endpointService.createEndpoint(endpoint);
                } else {
                    this.updateEndpoint(endpoint, existingEndpoints);
                }
            });
            log.info("Caldera executor provisioning based on " + endpoints.size() + " assets");
        } catch (ClientProtocolException | JsonProcessingException e) {
            log.log(Level.SEVERE, "Error running caldera service");
        }
    }

    public void launchExecutorSubprocess(@NotNull final String paw) {
        this.client.exploit("base64", paw, this.config.getOpenBasAbility().getAbility_id());
    }

    // -- PRIVATE --

    private List<Endpoint> toEndpoint(@NotNull final List<Agent> agents) {
        return agents.stream()
                .map((agent) -> {
                    Endpoint endpoint = new Endpoint();
                    endpoint.setExecutor(this.executor);
                    endpoint.setExternalReference(agent.getPaw());
                    endpoint.setName(agent.getHost());
                    endpoint.setDescription("Asset collect by Caldera");
                    endpoint.setIps(agent.getHost_ip_addrs());
                    endpoint.setHostname(agent.getHost());
                    endpoint.setPlatform(toPlatform(agent.getPlatform()));
                    endpoint.setLastSeen(toInstant(agent.getLast_seen()));
                    return endpoint;
                })
                .toList();
    }

    private void updateEndpoint(@NotNull final Endpoint external, @NotNull final List<Endpoint> existingList) {
        List<Endpoint> matchingExistingEndpoints = existingList.stream().filter(existingEndpoint -> existingEndpoint.getExternalReference() != null && existingEndpoint.getExternalReference().equals(external.getExternalReference()) && existingEndpoint.getActive()).toList();
        if (!matchingExistingEndpoints.isEmpty()) {
            Endpoint matchingExistingEndpoint = matchingExistingEndpoints.getFirst();
            matchingExistingEndpoint.setLastSeen(external.getLastSeen());
            this.endpointService.updateEndpoint(matchingExistingEndpoint);
            log.info("Updating existing endpoint " + matchingExistingEndpoint.getHostname());
        } else {
            List<Endpoint> matchingInactiveEndpoints = existingList.stream().filter(existingEndpoint -> !existingEndpoint.getActive()).toList();
            if (!matchingInactiveEndpoints.isEmpty()) {
                Endpoint matchingInactiveEndpoint = matchingInactiveEndpoints.getFirst();
                matchingInactiveEndpoint.setExecutor(this.executor);
                matchingInactiveEndpoint.setExternalReference(external.getExternalReference());
                matchingInactiveEndpoint.setLastSeen(external.getLastSeen());
                this.endpointService.updateEndpoint(matchingInactiveEndpoint);
                log.info("Update existing dead endpoint " + matchingInactiveEndpoint.getHostname());
            } else {
                external.setTemporaryExecution(true);
                this.endpointService.createEndpoint(external);
                log.info("Creating new temporary execution endpoint " + external.getHostname());
            }
        }
    }

    private Instant toInstant(@NotNull final String lastSeen) {
        String pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'";
        DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern(pattern, Locale.getDefault());
        LocalDateTime localDateTime = LocalDateTime.parse(lastSeen, dateTimeFormatter);
        ZonedDateTime zonedDateTime = localDateTime.atZone(UTC);
        return zonedDateTime.toInstant();
    }

    private List<Ability> abilities() {
        return this.client.abilities();
    }
}
