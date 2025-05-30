package io.openbas.utils;

import static io.openbas.database.model.Endpoint.*;
import static io.openbas.utils.AgentUtils.getPrimaryAgents;
import static java.util.Collections.emptySet;

import io.openbas.database.model.Asset;
import io.openbas.database.model.Endpoint;
import io.openbas.database.model.Tag;
import io.openbas.rest.asset.endpoint.form.EndpointOutput;
import io.openbas.rest.asset.endpoint.form.EndpointOverviewOutput;
import io.openbas.rest.asset.endpoint.form.EndpointSimple;

import java.util.Arrays;
import java.util.HashSet;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class EndpointMapper {

  final AgentMapper agentMapper;

  public EndpointOutput toEndpointOutput(Endpoint endpoint) {
    return EndpointOutput.builder()
        .id(endpoint.getId())
        .name(endpoint.getName())
        .type(endpoint.getType())
        .agents(agentMapper.toAgentOutputs(getPrimaryAgents(endpoint)))
        .platform(endpoint.getPlatform())
        .arch(endpoint.getArch())
        .tags(endpoint.getTags().stream().map(Tag::getId).collect(Collectors.toSet()))
        .build();
  }

  public EndpointSimple toEndpointSimple(Asset asset) {
    return EndpointSimple.builder().id(asset.getId()).name(asset.getName()).build();
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
                ? new HashSet<>(Arrays.asList(setIps(endpoint.getIps())))
                : emptySet())
        .macAddresses(
            endpoint.getMacAddresses() != null
                ? new HashSet<>(Arrays.asList(setMacAddresses(endpoint.getMacAddresses())))
                : emptySet())
        .agents(agentMapper.toAgentOutputs(getPrimaryAgents(endpoint)))
        .tags(endpoint.getTags().stream().map(Tag::getId).collect(Collectors.toSet()))
        .build();
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

  public static Endpoint.PLATFORM_TYPE toPlatform(@NotBlank final String platform) {
    return switch (platform) {
      case "Linux" -> Endpoint.PLATFORM_TYPE.Linux;
      case "Windows" -> Endpoint.PLATFORM_TYPE.Windows;
      case "Mac" -> Endpoint.PLATFORM_TYPE.MacOS;
      case "Container" -> Endpoint.PLATFORM_TYPE.Container;
      case "Service" -> Endpoint.PLATFORM_TYPE.Service;
      case "Generic" -> Endpoint.PLATFORM_TYPE.Generic;
      case "Internal" -> Endpoint.PLATFORM_TYPE.Internal;
      default -> Endpoint.PLATFORM_TYPE.Unknown;
    };
  }

  public static Endpoint.PLATFORM_ARCH toArch(@NotBlank final String arch) {
    return switch (arch) {
      case "x64", "x86_64" -> Endpoint.PLATFORM_ARCH.x86_64;
      case "arm64" -> Endpoint.PLATFORM_ARCH.arm64;
      default -> Endpoint.PLATFORM_ARCH.Unknown;
    };
  }
}
