package io.openbas.utils;

import static java.util.Collections.emptyList;

import io.openbas.database.model.Agent;
import io.openbas.database.model.Endpoint;
import io.openbas.database.model.Tag;
import io.openbas.rest.asset.endpoint.form.AgentOutput;
import io.openbas.rest.asset.endpoint.form.EndpointOutput;
import io.openbas.rest.asset.endpoint.form.EndpointOverviewOutput;
import io.openbas.rest.asset.endpoint.form.ExecutorOutput;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class EndpointMapper {

  public EndpointOutput toEndpointOutput(Endpoint endpoint) {
    return EndpointOutput.builder()
        .id(endpoint.getId())
        .name(endpoint.getName())
        .type(endpoint.getType())
        .agents(toAgentOutputs(endpoint.getAgents()))
        .platform(endpoint.getPlatform())
        .arch(endpoint.getArch())
        .tags(endpoint.getTags().stream().map(Tag::getId).toList())
        .build();
  }

  public EndpointOverviewOutput toEndpointOverviewOutput(Endpoint endpoint) {
    return EndpointOverviewOutput.builder()
        .id(endpoint.getId())
        .name(endpoint.getName())
        .description(endpoint.getDescription())
        .hostname(endpoint.getHostname())
        .platform(endpoint.getPlatform())
        .arch(endpoint.getArch())
        .ips(endpoint.getIps() != null ? Arrays.asList(endpoint.getIps()) : emptyList())
        .macAddresses(
            endpoint.getMacAddresses() != null
                ? Arrays.asList(endpoint.getMacAddresses())
                : emptyList())
        .agents(toAgentOutputs(endpoint.getAgents()))
        .tags(endpoint.getTags().stream().map(Tag::getId).toList())
        .build();
  }

  private List<AgentOutput> toAgentOutputs(List<Agent> agents) {
    return Optional.ofNullable(agents).orElse(emptyList()).stream()
        .map(agent -> toAgentOutput(agent))
        .toList();
  }

  private AgentOutput toAgentOutput(Agent agent) {
    AgentOutput.AgentOutputBuilder builder =
        AgentOutput.builder()
            .id(agent.getId())
            .privilege(agent.getPrivilege())
            .deploymentMode(agent.getDeploymentMode())
            .executedByUser(agent.getExecutedByUser())
            .isActive(agent.isActive())
            .lastSeen(agent.getLastSeen());

    if (agent.getExecutor() != null) {
      builder.executor(
          ExecutorOutput.builder()
              .id(agent.getExecutor().getId())
              .name(agent.getExecutor().getName())
              .type(agent.getExecutor().getType())
              .build());
    }
    return builder.build();
  }
}
