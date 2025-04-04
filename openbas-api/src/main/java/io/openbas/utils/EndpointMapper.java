package io.openbas.utils;

import static io.openbas.database.model.Endpoint.*;
import static io.openbas.utils.AgentUtils.isPrimaryAgent;
import static java.util.Collections.emptyList;
import static java.util.Collections.emptySet;

import io.openbas.database.model.Agent;
import io.openbas.database.model.Endpoint;
import io.openbas.database.model.Tag;
import io.openbas.rest.asset.endpoint.form.AgentOutput;
import io.openbas.rest.asset.endpoint.form.EndpointOutput;
import io.openbas.rest.asset.endpoint.form.EndpointOverviewOutput;
import io.openbas.rest.asset.endpoint.form.ExecutorOutput;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class EndpointMapper {

  public EndpointOutput toEndpointOutput(Endpoint endpoint) {
    return EndpointOutput.builder()
        .id(endpoint.getId())
        .name(endpoint.getName())
        .type(endpoint.getType())
        .agents(toAgentOutputs(getPrimaryAgents(endpoint)))
        .platform(endpoint.getPlatform())
        .arch(endpoint.getArch())
        .tags(endpoint.getTags().stream().map(Tag::getId).collect(Collectors.toSet()))
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
        .seenIp(endpoint.getSeenIp())
        .ips(
            endpoint.getIps() != null
                ? new HashSet<>(Arrays.asList(endpoint.getIps()))
                : emptySet())
        .macAddresses(
            endpoint.getMacAddresses() != null
                ? new HashSet<>(Arrays.asList(endpoint.getMacAddresses()))
                : emptySet())
        .agents(toAgentOutputs(getPrimaryAgents(endpoint)))
        .tags(endpoint.getTags().stream().map(Tag::getId).collect(Collectors.toSet()))
        .build();
  }

  private Set<AgentOutput> toAgentOutputs(List<Agent> agents) {
    return Optional.ofNullable(agents).orElse(emptyList()).stream()
        .map(this::toAgentOutput)
        .collect(Collectors.toSet());
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

  @NotNull
  private static List<Agent> getPrimaryAgents(Endpoint endpoint) {
    return endpoint.getAgents().stream()
        .filter(agent -> isPrimaryAgent(agent))
        .collect(Collectors.toList());
  }

  public static String[] setMacAddresses(String[] macAddresses) {
    if (macAddresses == null) {
      return new String[0];
    } else {
      return Arrays.stream(macAddresses)
          .map(macAddress -> macAddress.toLowerCase().replaceAll(REGEX_MAC_ADDRESS, ""))
          .filter(macAddress -> !BAD_MAC_ADDRESS.contains(macAddress))
          .distinct()
          .toArray(String[]::new);
    }
  }

  public static String[] setIps(String[] ips) {
    if (ips == null) {
      return new String[0];
    } else {
      return Arrays.stream(ips)
          .map(String::toLowerCase)
          .filter(ip -> !BAD_IP_ADDRESSES.contains(ip))
          .distinct()
          .toArray(String[]::new);
    }
  }

  public static String[] mergeAddressArrays(String[] array1, String[] array2) {
    if (array1 == null) {
      return array2;
    }
    if (array2 == null) {
      return array1;
    }
    return Stream.concat(Arrays.stream(array1), Arrays.stream(array2))
        .distinct()
        .toArray(String[]::new);
  }
}
