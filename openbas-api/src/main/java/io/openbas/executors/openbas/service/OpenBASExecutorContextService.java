package io.openbas.executors.openbas.service;

import static io.openbas.executors.ExecutorHelper.replaceArgs;
import static io.openbas.executors.openbas.OpenBASExecutor.OPENBAS_EXECUTOR_NAME;

import io.openbas.database.model.*;
import io.openbas.database.repository.AssetAgentJobRepository;
import io.openbas.executors.ExecutorContextService;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.stereotype.Service;

@Log
@Service(OPENBAS_EXECUTOR_NAME)
@RequiredArgsConstructor
public class OpenBASExecutorContextService extends ExecutorContextService {

  private final AssetAgentJobRepository assetAgentJobRepository;

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

    return switch (platform) {
      case Windows, Linux, MacOS -> {
        String executorCommandKey = platform.name() + "." + arch.name();
        String cmd = injector.getExecutorCommands().get(executorCommandKey);
        yield replaceArgs(platform, cmd, inject.getId(), agentId);
      }
      default -> throw new RuntimeException("Unsupported platform: " + platform);
    };
  }

  public void launchExecutorSubprocess(
      @NotNull final Inject inject,
      @NotNull final Endpoint assetEndpoint,
      @NotNull final Agent agent) {
    Endpoint.PLATFORM_TYPE platform = assetEndpoint.getPlatform();
    Endpoint.PLATFORM_ARCH arch = assetEndpoint.getArch();
    if (platform == null) {
      throw new RuntimeException("Unsupported null platform");
    }
    AssetAgentJob assetAgentJob = new AssetAgentJob();
    assetAgentJob.setCommand(computeCommand(inject, agent.getId(), platform, arch));
    assetAgentJob.setAgent(agent);
    assetAgentJob.setInject(inject);
    assetAgentJobRepository.save(assetAgentJob);
  }

  public List<Agent> launchBatchExecutorSubprocess(
      Inject inject, List<Agent> agents, InjectStatus injectStatus) {
    return new ArrayList<>();
  }
}
