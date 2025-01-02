package io.openbas.executors.crowdstrike.service;

import io.openbas.database.model.*;
import io.openbas.executors.crowdstrike.client.CrowdStrikeExecutorClient;
import io.openbas.executors.crowdstrike.config.CrowdStrikeExecutorConfig;
import jakarta.validation.constraints.NotNull;
import java.util.Base64;
import java.util.Objects;
import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Log
@Service
public class CrowdStrikeExecutorContextService {
  private CrowdStrikeExecutorConfig crowdStrikeExecutorConfig;

  private CrowdStrikeExecutorClient crowdStrikeExecutorClient;

  @Autowired
  public void setCrowdStrikeExecutorConfig(CrowdStrikeExecutorConfig crowdStrikeExecutorConfig) {
    this.crowdStrikeExecutorConfig = crowdStrikeExecutorConfig;
  }

  @Autowired
  public void setCrowdStrikeExecutorClient(CrowdStrikeExecutorClient crowdStrikeExecutorClient) {
    this.crowdStrikeExecutorClient = crowdStrikeExecutorClient;
  }

  public void launchExecutorSubprocess(
      @NotNull final Inject inject, @NotNull final Endpoint assetEndpoint) {
    Injector injector =
        inject
            .getInjectorContract()
            .map(InjectorContract::getInjector)
            .orElseThrow(
                () -> new UnsupportedOperationException("Inject does not have a contract"));

    Endpoint.PLATFORM_TYPE platform =
        Objects.equals(assetEndpoint.getType(), "Endpoint") ? assetEndpoint.getPlatform() : null;
    Endpoint.PLATFORM_ARCH arch =
        Objects.equals(assetEndpoint.getType(), "Endpoint") ? assetEndpoint.getArch() : null;
    if (platform == null || arch == null) {
      throw new RuntimeException("Unsupported platform: " + platform + " (arch:" + arch + ")");
    }
    switch (platform) {
      case Endpoint.PLATFORM_TYPE.Windows -> {
        String command =
            injector
                .getExecutorCommands()
                .get(Endpoint.PLATFORM_TYPE.Windows.name() + "." + arch.name())
                .replace("\"#{location}\"", "$PWD.Path")
                .replace("#{inject}", inject.getId());
        this.crowdStrikeExecutorClient.executeAction(
            assetEndpoint.getAgents().getFirst().getExternalReference(),
            this.crowdStrikeExecutorConfig.getWindowsScriptName(),
            Base64.getEncoder().encodeToString(command.getBytes()));
      }
      case Endpoint.PLATFORM_TYPE.Linux -> {
        String command =
            injector
                .getExecutorCommands()
                .get(Endpoint.PLATFORM_TYPE.Linux.name() + "." + arch.name())
                .replace("\"#{location}\"", "$(pwd)")
                .replace("#{inject}", inject.getId());
        this.crowdStrikeExecutorClient.executeAction(
            assetEndpoint.getAgents().getFirst().getExternalReference(),
            this.crowdStrikeExecutorConfig.getUnixScriptName(),
            Base64.getEncoder().encodeToString(command.getBytes()));
      }
      case Endpoint.PLATFORM_TYPE.MacOS -> {
        String command =
            injector
                .getExecutorCommands()
                .get(Endpoint.PLATFORM_TYPE.MacOS.name() + "." + arch.name())
                .replace("\"#{location}\"", "$(pwd)")
                .replace("#{inject}", inject.getId());
        this.crowdStrikeExecutorClient.executeAction(
            assetEndpoint.getAgents().getFirst().getExternalReference(),
            this.crowdStrikeExecutorConfig.getUnixScriptName(),
            Base64.getEncoder().encodeToString(command.getBytes()));
      }
      default -> throw new RuntimeException("Unsupported platform: " + platform);
    }
    ;
  }

  public void launchExecutorClear(@NotNull final Injector injector, @NotNull final Asset asset) {}
}
