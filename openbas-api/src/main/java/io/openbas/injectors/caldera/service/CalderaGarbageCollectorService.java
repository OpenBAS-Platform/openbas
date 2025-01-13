package io.openbas.injectors.caldera.service;

import static java.time.Instant.now;

import io.openbas.database.model.Endpoint;
import io.openbas.database.specification.EndpointSpecification;
import io.openbas.injectors.caldera.client.CalderaInjectorClient;
import io.openbas.injectors.caldera.client.model.Agent;
import io.openbas.service.EndpointService;
import io.openbas.utils.Time;
import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;
import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
      CalderaInjectorClient client, EndpointService endpointService) {
    this.client = client;
    this.endpointService = endpointService;
  }

  @Override
  public void run() {
    log.info("Running Caldera injector garbage collector...");
    List<Endpoint> endpoints =
        this.endpointService.endpoints(EndpointSpecification.findEndpointsForExecution());
    log.info("Running Caldera injector garbage collector on " + endpoints.size() + " endpoints");
    endpoints.forEach(
        endpoint -> {
          if ((now().toEpochMilli() - endpoint.getCreatedAt().toEpochMilli()) > DELETE_TTL) {
            this.endpointService.deleteEndpoint(endpoint.getId());
          }
        });
    List<Agent> agents = this.client.agents();
    log.info("Running Caldera injector garbage collector on " + agents.size() + " agents");
    List<String> killedAgents = new ArrayList<>();
    agents.forEach(
        agent -> {
          if (agent.getExe_name().contains("implant")
              && (now().toEpochMilli() - Time.toInstant(agent.getCreated()).toEpochMilli())
                  > KILL_TTL
              && (now().toEpochMilli() - Time.toInstant(agent.getLast_seen()).toEpochMilli())
                  < KILL_TTL) {
            try {
              log.info("Killing agent " + agent.getHost());
              client.killAgent(agent);
              killedAgents.add(agent.getPaw());
            } catch (RuntimeException e) {
              log.info("Failed to kill agent, probably already killed");
            }
          }
        });
    agents.forEach(
        agent -> {
          if (agent.getExe_name().contains("implant")
              && (now().toEpochMilli() - Time.toInstant(agent.getCreated()).toEpochMilli())
                  > DELETE_TTL
              && !killedAgents.contains(agent.getPaw())) {
            try {
              log.info("Deleting agent " + agent.getHost());
              client.deleteAgent(agent);
            } catch (RuntimeException e) {
              log.severe("Failed to delete agent");
            }
          }
        });
  }
}
