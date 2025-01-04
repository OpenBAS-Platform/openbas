package io.openbas.utils;

import io.openbas.database.model.Agent;
import io.openbas.database.model.Endpoint;
import io.openbas.database.model.Tag;
import io.openbas.rest.asset.endpoint.form.AgentOutput;
import io.openbas.rest.asset.endpoint.form.EndpointOutput;
import io.openbas.rest.asset.endpoint.form.EndpointOverviewOutput;
import io.openbas.rest.asset.endpoint.form.ExecutorOutput;
import java.util.Arrays;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class EndpointMapper {

  public EndpointOutput toEndpointOutput(Endpoint endpoint) {
    return EndpointOutput.builder()
        .name(endpoint.getName())
        .isActive(endpoint.getAgents().stream().anyMatch(agent -> agent.isActive()))
        .privileges(endpoint.getAgents().stream().map(agent -> agent.getPrivilege()).toList())
        .platform(endpoint.getPlatform())
        .arch(endpoint.getArch())
        .executors(
            endpoint.getAgents().stream()
                .filter(agent -> agent.getExecutor() != null)
                .map(
                    agent ->
                        ExecutorOutput.builder()
                            .name(agent.getExecutor().getName())
                            .type(agent.getExecutor().getType())
                            .build())
                .toList())
        .tags(endpoint.getTags().stream().map(Tag::getId).toList())
        .build();
  }

  public EndpointOverviewOutput toEndpointOverviewOutput(Endpoint endpoint) {
    return EndpointOverviewOutput.builder()
        .name(endpoint.getName())
        .description(endpoint.getDescription())
        .hostname(endpoint.getHostname())
        .platform(endpoint.getPlatform())
        .arch(endpoint.getArch())
        .ips(Arrays.asList(endpoint.getIps()))
        .macAddresses(Arrays.asList(endpoint.getMacAddresses()))
        .agents(this.toAgentOutputs(endpoint.getAgents()))
        .tags(endpoint.getTags().stream().map(Tag::getId).toList())
        .build();
  }

  private List<AgentOutput> toAgentOutputs(List<Agent> agents) {
    return agents.stream().map(agent -> this.toAgentOutput(agent)).toList();
  }

  private AgentOutput toAgentOutput(Agent agent) {
    return AgentOutput.builder()
        .id(agent.getId())
        .privilege(agent.getPrivilege())
        .deploymentMode(agent.getDeploymentMode())
        .executedByUser(agent.getExecutedByUser())
        .executor(
            ExecutorOutput.builder()
                .name(agent.getExecutor().getName())
                .type(agent.getExecutor().getType())
                .build())
        .isActive(agent.isActive())
        .build();
  }
}
