package io.openbas.executors.crowdstrike.service;

import static io.openbas.executors.ExecutorHelper.replaceArgs;
import static io.openbas.executors.crowdstrike.service.CrowdStrikeExecutorService.CROWDSTRIKE_EXECUTOR_NAME;

import io.openbas.database.model.*;
import io.openbas.executors.ExecutorContextService;
import io.openbas.executors.crowdstrike.client.CrowdStrikeExecutorClient;
import io.openbas.executors.crowdstrike.config.CrowdStrikeExecutorConfig;
import io.openbas.rest.exception.AgentException;
import jakarta.validation.constraints.NotNull;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Objects;
import java.util.UUID;
import java.util.regex.Matcher;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.stereotype.Service;

@Log
@Service(CROWDSTRIKE_EXECUTOR_NAME)
@RequiredArgsConstructor
public class CrowdStrikeExecutorContextService extends ExecutorContextService {

  private final CrowdStrikeExecutorConfig crowdStrikeExecutorConfig;
  private final CrowdStrikeExecutorClient crowdStrikeExecutorClient;

  public void launchExecutorSubprocess(
      @NotNull final Inject inject,
      @NotNull final Endpoint assetEndpoint,
      @NotNull final Agent agent)
      throws AgentException {

    if (!this.crowdStrikeExecutorConfig.isEnable()) {
      throw new AgentException("Fatal error: CrowdStrike executor is not enabled", agent);
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

    String scriptName;
    String implantLocation;
    switch (platform) {
      case Windows -> {
        scriptName = this.crowdStrikeExecutorConfig.getWindowsScriptName();
        implantLocation =
            "$location=\"C:\\Windows\\Temp\\.openbas\\implant-"
                + UUID.randomUUID()
                + "\";md $location -ea 0;[Environment]::CurrentDirectory";
      }
      case Linux, MacOS -> {
        scriptName = this.crowdStrikeExecutorConfig.getUnixScriptName();
        implantLocation =
            "location=/tmp/.openbas/implant-" + UUID.randomUUID() + ";mkdir -p $location;filename=";
      }
      default -> throw new RuntimeException("Unsupported platform: " + platform);
    }
    ;

    String executorCommandKey = platform.name() + "." + arch.name();
    String command = injector.getExecutorCommands().get(executorCommandKey);

    command = replaceArgs(platform, command, inject.getId(), agent.getId());
    command =
        platform == Endpoint.PLATFORM_TYPE.Windows
            ? command.replaceFirst(
                "\\$?x=.+location=.+;\\[Environment]::CurrentDirectory",
                Matcher.quoteReplacement(implantLocation))
            : command.replaceFirst(
                "\\$?x=.+location=.+;filename=", Matcher.quoteReplacement(implantLocation));

    String commandEncoded =
        platform == Endpoint.PLATFORM_TYPE.Windows
            ? Base64.getEncoder().encodeToString(command.getBytes(StandardCharsets.UTF_16LE))
            : Base64.getEncoder().encodeToString(command.getBytes(StandardCharsets.UTF_8));

    this.crowdStrikeExecutorClient.executeAction(
        agent.getExternalReference(), scriptName, commandEncoded);
  }
}
