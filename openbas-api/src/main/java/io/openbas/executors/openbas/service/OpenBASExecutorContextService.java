package io.openbas.executors.openbas.service;

import io.openbas.database.model.*;
import io.openbas.database.repository.AssetAgentJobRepository;
import jakarta.validation.constraints.NotNull;
import java.util.Objects;
import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Log
@Service
public class OpenBASExecutorContextService {

  private AssetAgentJobRepository assetAgentJobRepository;

  @Autowired
  public void setAssetAgentJobRepository(AssetAgentJobRepository assetAgentJobRepository) {
    this.assetAgentJobRepository = assetAgentJobRepository;
  }

  private String computeCommand(
      @NotNull final Inject inject,
      String agentId,
      Endpoint.PLATFORM_TYPE platform,
      Endpoint.PLATFORM_ARCH arch) {
    Injector injector =
        inject
            .getInjectorContract()
            .map(InjectorContract::getInjector)
            .orElseThrow(
                () -> new UnsupportedOperationException("Inject does not have a contract"));

    switch (platform) {
      case Endpoint.PLATFORM_TYPE.Windows -> {
        return injector
            .getExecutorCommands()
            .get(Endpoint.PLATFORM_TYPE.Windows.name() + "." + arch.name())
            .replace("#{inject}", inject.getId())
            .replace("#{agent}", agentId);
      }
      case Endpoint.PLATFORM_TYPE.Linux -> {
        return injector
            .getExecutorCommands()
            .get(Endpoint.PLATFORM_TYPE.Linux.name() + "." + arch.name())
            .replace("#{inject}", inject.getId())
            .replace("#{agent}", agentId);
      }
      case Endpoint.PLATFORM_TYPE.MacOS -> {
        return injector
            .getExecutorCommands()
            .get(Endpoint.PLATFORM_TYPE.MacOS.name() + "." + arch.name())
            .replace("#{inject}", inject.getId())
            .replace("#{agent}", agentId);
      }
      default -> throw new RuntimeException("Unsupported platform: " + platform);
    }
  }

  public void launchExecutorSubprocess(
      @NotNull final Inject inject, @NotNull final Endpoint assetEndpoint) {
    Endpoint.PLATFORM_TYPE platform =
        Objects.equals(assetEndpoint.getType(), "Endpoint") ? assetEndpoint.getPlatform() : null;
    Endpoint.PLATFORM_ARCH arch =
        Objects.equals(assetEndpoint.getType(), "Endpoint") ? assetEndpoint.getArch() : null;
    if (platform == null) {
      throw new RuntimeException("Unsupported null platform");
    }
    AssetAgentJob assetAgentJob = new AssetAgentJob();
    assetAgentJob.setCommand(
        computeCommand(inject, assetEndpoint.getAgents().getFirst().getId(), platform, arch));
    assetAgentJob.setAgent(assetEndpoint.getAgents().getFirst());
    assetAgentJob.setInject(inject);
    assetAgentJobRepository.save(assetAgentJob);
  }

  public void launchExecutorClear(@NotNull final Injector injector, @NotNull final Asset asset) {
    // TODO
  }
}
