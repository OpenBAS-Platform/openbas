package io.openbas.executors.caldera.service;

import static io.openbas.service.EndpointService.DELETE_TTL;
import static io.openbas.utils.Time.toInstant;
import static java.time.Instant.now;

import com.cronutils.utils.VisibleForTesting;
import io.openbas.database.model.*;
import io.openbas.executors.ExecutorService;
import io.openbas.executors.caldera.client.CalderaExecutorClient;
import io.openbas.executors.caldera.config.CalderaExecutorConfig;
import io.openbas.executors.caldera.model.Agent;
import io.openbas.integrations.InjectorService;
import io.openbas.service.AgentService;
import io.openbas.service.EndpointService;
import io.openbas.service.PlatformSettingsService;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.*;
import java.util.logging.Level;
import java.util.stream.Collectors;
import lombok.extern.java.Log;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Log
@Service
public class CalderaExecutorService implements Runnable {

  private static final int CLEAR_TTL = 1800000; // 30 minutes
  private static final String CALDERA_EXECUTOR_TYPE = "openbas_caldera";
  public static final String CALDERA_EXECUTOR_NAME = "Caldera";

  private final CalderaExecutorClient client;

  private final EndpointService endpointService;

  private final CalderaExecutorContextService calderaExecutorContextService;

  private final InjectorService injectorService;
  private final PlatformSettingsService platformSettingsService;
  private final AgentService agentService;

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
      PlatformSettingsService platformSettingsService,
      AgentService agentService) {
    this.client = client;
    this.endpointService = endpointService;
    this.calderaExecutorContextService = calderaExecutorContextService;
    this.injectorService = injectorService;
    this.platformSettingsService = platformSettingsService;
    this.agentService = agentService;
    try {
      if (config.isEnable()) {
        this.executor =
            executorService.register(
                config.getId(),
                CALDERA_EXECUTOR_TYPE,
                CALDERA_EXECUTOR_NAME,
                null,
                getClass().getResourceAsStream("/img/icon-caldera.png"),
                new String[] {
                  Endpoint.PLATFORM_TYPE.Windows.name(),
                  Endpoint.PLATFORM_TYPE.Linux.name(),
                  Endpoint.PLATFORM_TYPE.MacOS.name()
                });
        this.calderaExecutorContextService.registerAbilities();
      } else {
        this.platformSettingsService.cleanMessage(BannerMessage.BANNER_KEYS.CALDERA_UNAVAILABLE);
        executorService.removeFromType(CALDERA_EXECUTOR_TYPE);
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
      // This is NOT a standard behaviour, this is because we are using Caldera as an executor and
      // we should not
      // Will be replaced by the XTM agent
      List<io.openbas.database.model.Agent> endpointAgentList =
          toAgentEndpoint(
              this.client.agents().stream()
                  .filter(agent -> !agent.getExe_name().contains("implant"))
                  .toList());
      log.info("Caldera executor provisioning based on " + endpointAgentList.size() + " assets");

      for (io.openbas.database.model.Agent agent : endpointAgentList) {
        registerAgentEndpoint(agent);
      }
      this.platformSettingsService.cleanMessage(BannerMessage.BANNER_KEYS.CALDERA_UNAVAILABLE);
    } catch (Exception e) {
      this.platformSettingsService.errorMessage(BannerMessage.BANNER_KEYS.CALDERA_UNAVAILABLE);
    }
  }

  private void registerAgentEndpoint(io.openbas.database.model.Agent agent) {
    Endpoint endpoint = (Endpoint) Hibernate.unproxy(agent.getAsset());
    // Check if agent exists (only 1 agent can be found for Caldera)
    List<io.openbas.database.model.Agent> optionalAgents =
        agentService.findByExternalReference(agent.getExternalReference());
    if (!optionalAgents.isEmpty()) {
      io.openbas.database.model.Agent existingAgent = optionalAgents.getFirst();
      if (agent.isActive()) {
        endpoint.setId(existingAgent.getAsset().getId());
        manageOptAgentAndRegisterAgentEndpoint(Optional.of(existingAgent), agent, endpoint);
      } else {
        // Delete inactive agent
        handleInactiveAgent(existingAgent);
      }
    } else {
      // Check if endpoint exists
      manageOptEndpointAndRegisterAgentEndpoint(agent, endpoint);
    }
  }

  private void handleInactiveAgent(io.openbas.database.model.Agent existingAgent) {
    if ((now().toEpochMilli() - existingAgent.getLastSeen().toEpochMilli()) > DELETE_TTL) {
      log.info(
          "Found stale endpoint "
              + existingAgent.getAsset().getName()
              + ", deleting the "
              + CALDERA_EXECUTOR_TYPE
              + " agent "
              + existingAgent.getExecutedByUser()
              + " in it...");
      this.client.deleteAgent(existingAgent.getExternalReference());
      this.agentService.deleteAgent(existingAgent.getId());
    }
  }

  private void manageOptEndpointAndRegisterAgentEndpoint(
      io.openbas.database.model.Agent agent, Endpoint endpoint) {
    Optional<Endpoint> optionalEndpoint =
        endpointService.findEndpointByHostnameAndAtLeastOneIp(
            endpoint.getHostname(), endpoint.getIps());
    if (optionalEndpoint.isPresent()) {
      String endpointId = optionalEndpoint.get().getId();
      Optional<io.openbas.database.model.Agent> optionalAgent =
          agentService.getAgentForAnAsset(
              endpointId,
              agent.getExecutedByUser(),
              agent.getDeploymentMode(),
              agent.getPrivilege(),
              CALDERA_EXECUTOR_TYPE);
      endpoint.setId(endpointId);
      manageOptAgentAndRegisterAgentEndpoint(optionalAgent, agent, endpoint);
    } else {
      // Nothing exists, create endpoint and agent
      endpointService.createNewEndpointAndAgent(agent, endpoint);
    }
  }

  private void manageOptAgentAndRegisterAgentEndpoint(
      Optional<io.openbas.database.model.Agent> optionalAgent,
      io.openbas.database.model.Agent agent,
      Endpoint endpoint) {
    io.openbas.database.model.Agent agentToUpdate;
    if (optionalAgent.isPresent()) {
      // Update this specific agent
      agentToUpdate = optionalAgent.get();
      agentToUpdate.setProcessName(agent.getProcessName());
      agentToUpdate.setLastSeen(agent.getLastSeen());
      agentToUpdate.setExternalReference(agent.getExternalReference());
    } else {
      // Create this specific agent
      agentToUpdate = agent;
    }
    // Update the endpoint and the agent on it
    Endpoint endpointToUpdate = (Endpoint) Hibernate.unproxy(agentToUpdate.getAsset());
    endpointToUpdate.setId(endpoint.getId());
    // Hostname not updated by Crowdstrike because Crowdstrike hostname is 15 length max
    endpointToUpdate.setHostname(endpoint.getHostname());
    endpointToUpdate.addAllIpAddresses(endpoint.getIps());
    Endpoint updatedEndpoint = endpointService.updateEndpoint(endpointToUpdate);
    agentToUpdate.setAsset(updatedEndpoint);
    clearAbilityForAgent(agentToUpdate);
    agentService.createOrUpdateAgent(agentToUpdate);
  }

  // -- PRIVATE --

  private List<io.openbas.database.model.Agent> toAgentEndpoint(
      @NotNull final List<Agent> agentsCaldera) {
    return agentsCaldera.stream()
        .map(
            agent -> {
              Endpoint endpoint = new Endpoint();
              endpoint.setName(agent.getHost());
              endpoint.setIps(agent.getHost_ip_addrs());
              endpoint.setHostname(agent.getHost());
              endpoint.setPlatform(toPlatform(agent.getPlatform()));
              endpoint.setArch(toArch(agent.getArchitecture()));
              io.openbas.database.model.Agent agentEndpoint = new io.openbas.database.model.Agent();
              agentEndpoint.setExecutor(this.executor);
              agentEndpoint.setExternalReference(agent.getPaw());
              agentEndpoint.setPrivilege(io.openbas.database.model.Agent.PRIVILEGE.admin);
              agentEndpoint.setDeploymentMode(
                  io.openbas.database.model.Agent.DEPLOYMENT_MODE.session);
              agentEndpoint.setExecutedByUser(agent.getUsername());
              agentEndpoint.setLastSeen(toInstant(agent.getLast_seen()));
              agentEndpoint.setProcessName(agent.getExe_name());
              agentEndpoint.setAsset(endpoint);
              return agentEndpoint;
            })
        .collect(Collectors.toList());
  }

  /**
   * Used to delete existing agent in Caldera application if the clear ttl is reached (that means if
   * agent Caldera is inactive in the Caldera app)
   */
  private void clearAbilityForAgent(@NotNull final io.openbas.database.model.Agent existingAgent) {
    if ((now().toEpochMilli() - existingAgent.getClearedAt().toEpochMilli()) > CLEAR_TTL) {
      try {
        log.info("Clearing agent caldera " + existingAgent.getExecutedByUser());
        Iterable<Injector> injectors = injectorService.injectors();
        injectors.forEach(
            injector -> {
              if (injector.getExecutorClearCommands() != null) {
                this.calderaExecutorContextService.launchExecutorClear(injector, existingAgent);
              }
            });
        existingAgent.setClearedAt(now());
      } catch (RuntimeException e) {
        log.info("Failed clear agents");
      }
    }
  }

  @VisibleForTesting
  protected void setExecutor(Executor executor) {
    this.executor = executor;
  }
}
