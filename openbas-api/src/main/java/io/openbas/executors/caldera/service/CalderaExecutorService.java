package io.openbas.executors.caldera.service;

import static io.openbas.service.EndpointService.DELETE_TTL;
import static io.openbas.utils.Time.toInstant;
import static java.time.Instant.now;

import com.cronutils.utils.VisibleForTesting;
import io.openbas.database.model.*;
import io.openbas.database.model.Agent.DEPLOYMENT_MODE;
import io.openbas.database.model.Agent.PRIVILEGE;
import io.openbas.executors.ExecutorService;
import io.openbas.executors.caldera.client.CalderaExecutorClient;
import io.openbas.executors.caldera.config.CalderaExecutorConfig;
import io.openbas.executors.caldera.model.Agent;
import io.openbas.integrations.InjectorService;
import io.openbas.rest.asset.endpoint.form.EndpointRegisterInput;
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
      List<EndpointRegisterInput> endpointRegisterList =
          toAgentEndpoint(
              this.client.agents().stream()
                  .filter(agent -> !agent.getExe_name().contains("implant"))
                  .toList());
      log.info("Caldera executor provisioning based on " + endpointRegisterList.size() + " assets");

      for (EndpointRegisterInput input : endpointRegisterList) {
        registerAgentEndpoint(input);
      }
      this.platformSettingsService.cleanMessage(BannerMessage.BANNER_KEYS.CALDERA_UNAVAILABLE);
    } catch (Exception e) {
      this.platformSettingsService.errorMessage(BannerMessage.BANNER_KEYS.CALDERA_UNAVAILABLE);
    }
  }

  private void registerAgentEndpoint(EndpointRegisterInput input) {
    // Check if agent exists (only 1 agent can be found for Caldera)
    List<io.openbas.database.model.Agent> optionalAgents =
        agentService.findByExternalReference(input.getExternalReference());
    if (!optionalAgents.isEmpty()) {
      io.openbas.database.model.Agent existingAgent = optionalAgents.getFirst();
      if (input.isActive()) {
        updateExistingAgent(existingAgent, input);
      } else {
        // Delete inactive agent
        handleInactiveAgent(existingAgent);
      }
    } else {
      // Check if endpoint exists
      List<Endpoint> optionalEndpoints =
          endpointService.findEndpointByHostname(
              input.getHostname(), input.getPlatform(), input.getArch());
      if (optionalEndpoints.size() == 1) {
        updateExistingEndpointAndManageAgent(optionalEndpoints.getFirst(), input);
      } else {
        optionalEndpoints =
            endpointService.findEndpointByHostnameAndAtLeastOneIp(
                input.getHostname(), input.getPlatform(), input.getArch(), input.getIps());
        if (optionalEndpoints.size() == 1) {
          updateExistingEndpointAndManageAgent(optionalEndpoints.getFirst(), input);
        } else {
          // Nothing exists, create endpoint and agent
          createNewEndpointAndAgent(input);
        }
      }
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

  private void createOrUpdateAgent(Endpoint endpoint, EndpointRegisterInput input) {
    DEPLOYMENT_MODE deploymentMode =
        input.isService() ? DEPLOYMENT_MODE.service : DEPLOYMENT_MODE.session;
    PRIVILEGE privilege = input.isElevated() ? PRIVILEGE.admin : PRIVILEGE.standard;
    Optional<io.openbas.database.model.Agent> optionalAgent =
        agentService.getAgentForAnAsset(
            endpoint.getId(),
            input.getExecutedByUser(),
            deploymentMode,
            privilege,
            CALDERA_EXECUTOR_TYPE);
    io.openbas.database.model.Agent agent;
    if (optionalAgent.isPresent()) {
      agent = optionalAgent.get();
    } else {
      agent = new io.openbas.database.model.Agent();
      setNewAgentAttributes(input, agent);
    }
    setUpdatedAgentAttributes(agent, input, endpoint);
    agentService.createOrUpdateAgent(agent);
  }

  private void setNewAgentAttributes(
      EndpointRegisterInput input, io.openbas.database.model.Agent agent) {
    agent.setPrivilege(input.isElevated() ? PRIVILEGE.admin : PRIVILEGE.standard);
    agent.setDeploymentMode(input.isService() ? DEPLOYMENT_MODE.service : DEPLOYMENT_MODE.session);
    agent.setExecutedByUser(input.getExecutedByUser());
    agent.setExecutor(input.getExecutor());
  }

  private void updateExistingEndpointAndManageAgent(
      Endpoint endpoint, EndpointRegisterInput input) {
    endpoint.setHostname(input.getHostname());
    endpoint.addAllIpAddresses(input.getIps());
    endpointService.updateEndpoint(endpoint);
    createOrUpdateAgent(endpoint, input);
  }

  private void updateExistingAgent(
      io.openbas.database.model.Agent agent, EndpointRegisterInput input) {
    Endpoint endpoint = (Endpoint) Hibernate.unproxy(agent.getAsset());
    endpoint.setHostname(input.getHostname());
    endpoint.addAllIpAddresses(input.getIps());
    endpointService.updateEndpoint(endpoint);
    setUpdatedAgentAttributes(agent, input, endpoint);
    agentService.createOrUpdateAgent(agent);
  }

  private void setUpdatedAgentAttributes(
      io.openbas.database.model.Agent agent, EndpointRegisterInput input, Endpoint endpoint) {
    agent.setAsset(endpoint);
    agent.setProcessName(input.getProcessName());
    agent.setLastSeen(input.getLastSeen());
    agent.setExternalReference(input.getExternalReference());
    clearAbilityForAgent(agent);
  }

  private void createNewEndpointAndAgent(EndpointRegisterInput input) {
    Endpoint endpoint = new Endpoint();
    endpoint.setUpdateAttributes(input);
    endpoint.addAllIpAddresses(input.getIps());
    endpointService.createEndpoint(endpoint);
    io.openbas.database.model.Agent agent = new io.openbas.database.model.Agent();
    setUpdatedAgentAttributes(agent, input, endpoint);
    setNewAgentAttributes(input, agent);
    agentService.createOrUpdateAgent(agent);
  }

  // -- PRIVATE --

  private List<EndpointRegisterInput> toAgentEndpoint(@NotNull final List<Agent> agentsCaldera) {
    return agentsCaldera.stream()
        .map(
            agent -> {
              EndpointRegisterInput input = new EndpointRegisterInput();
              input.setName(agent.getHost());
              input.setIps(agent.getHost_ip_addrs());
              input.setHostname(agent.getHost());
              input.setPlatform(toPlatform(agent.getPlatform()));
              input.setArch(toArch(agent.getArchitecture()));
              input.setExecutor(this.executor);
              input.setExternalReference(agent.getPaw());
              input.setElevated(true);
              input.setService(false);
              input.setExecutedByUser(agent.getUsername());
              input.setLastSeen(toInstant(agent.getLast_seen()));
              input.setProcessName(agent.getExe_name());
              return input;
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
