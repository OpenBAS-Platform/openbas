package io.openbas.executors.tanium.service;

import static io.openbas.executors.ExecutorHelper.replaceArgs;

import io.openbas.database.model.*;
import io.openbas.executors.ExecutorContextService;
import io.openbas.executors.tanium.client.TaniumExecutorClient;
import io.openbas.executors.tanium.config.TaniumExecutorConfig;
import io.openbas.rest.exception.AgentException;
import jakarta.validation.constraints.NotNull;
import java.util.Base64;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.stereotype.Service;

@Log
@Service(TaniumExecutorContextService.TANIUM_EXECUTOR_CONTEXT)
@RequiredArgsConstructor
public class TaniumExecutorContextService extends ExecutorContextService {

  public static final String TANIUM_EXECUTOR_CONTEXT = "TaniumExecutorContext";
  private final TaniumExecutorConfig taniumExecutorConfig;
  private final TaniumExecutorClient taniumExecutorClient;

  public void launchExecutorSubprocess(
      @NotNull final Inject inject,
      @NotNull final Endpoint assetEndpoint,
      @NotNull final Agent agent)
      throws AgentException {

    if (!this.taniumExecutorConfig.isEnable()) {
      throw new AgentException("Fatal error: Tanium executor is not enabled", agent);
    }

    Endpoint.PLATFORM_TYPE platform =
        Objects.equals(assetEndpoint.getType(), "Endpoint") ? assetEndpoint.getPlatform() : null;
    Endpoint.PLATFORM_ARCH arch =
        Objects.equals(assetEndpoint.getType(), "Endpoint") ? assetEndpoint.getArch() : null;
    if (platform == null || arch == null) {
      throw new RuntimeException("Unsupported platform: " + platform + " (arch:" + arch + ")");
    }

    Injector injector =
        inject
            .getInjectorContract()
            .map(InjectorContract::getInjector)
            .orElseThrow(
                () -> new UnsupportedOperationException("Inject does not have a contract"));

    Integer packageId =
        switch (platform) {
          case Windows -> this.taniumExecutorConfig.getWindowsPackageId();
          case Linux, MacOS -> this.taniumExecutorConfig.getUnixPackageId();
          default -> throw new RuntimeException("Unsupported platform: " + platform);
        };

    String executorCommandKey = platform.name() + "." + arch.name();
    String command = injector.getExecutorCommands().get(executorCommandKey);
    command = replaceArgs(platform, command, inject.getId(), agent.getId());

    this.taniumExecutorClient.executeAction(
        agent.getExternalReference(),
        packageId,
        Base64.getEncoder().encodeToString(command.getBytes()));
  }
}
