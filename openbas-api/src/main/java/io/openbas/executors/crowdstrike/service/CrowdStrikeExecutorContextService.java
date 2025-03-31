package io.openbas.executors.crowdstrike.service;

import static io.openbas.executors.ExecutorHelper.replaceArgs;
import static io.openbas.executors.crowdstrike.service.CrowdStrikeExecutorService.CROWDSTRIKE_EXECUTOR_NAME;

import io.openbas.database.model.*;
import io.openbas.executors.ExecutorContextService;
import io.openbas.executors.ExecutorHelper;
import io.openbas.executors.crowdstrike.client.CrowdStrikeExecutorClient;
import io.openbas.executors.crowdstrike.config.CrowdStrikeExecutorConfig;
import io.openbas.rest.exception.AgentException;
import jakarta.validation.constraints.NotNull;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import java.util.regex.Matcher;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.stereotype.Service;

@Log
@Service(CROWDSTRIKE_EXECUTOR_NAME)
@RequiredArgsConstructor
public class CrowdStrikeExecutorContextService extends ExecutorContextService {

  private static final String IMPLANT_LOCATION_WINDOWS = "\"C:\\Windows\\Temp\\.openbas\\";
  private static final String IMPLANT_LOCATION_UNIX = "/tmp/.openbas/";

  private final CrowdStrikeExecutorConfig crowdStrikeExecutorConfig;
  private final CrowdStrikeExecutorClient crowdStrikeExecutorClient;

  public void launchExecutorSubprocess(
      @NotNull final Inject inject,
      @NotNull final Endpoint assetEndpoint,
      @NotNull final Agent agent) {}

  public void launchBatchExecutorSubprocess(
      Inject inject, List<Agent> agents, InjectStatus injectStatus) throws AgentException {
    if (!this.crowdStrikeExecutorConfig.isEnable()) {
      throw new RuntimeException("CrowdStrike executor is not enabled"); // TODO test exception
    }

    Injector injector =
        inject
            .getInjectorContract()
            .map(InjectorContract::getInjector)
            .orElseThrow(
                () -> new UnsupportedOperationException("Inject does not have a contract"));

    // TODO rework
    String scriptName = "";
    String commandEncoded = "";
    for (Agent agent : agents) {
      Endpoint endpoint = (Endpoint) agent.getAsset();
      Endpoint.PLATFORM_TYPE platform = endpoint.getPlatform();
      Endpoint.PLATFORM_ARCH arch = endpoint.getArch();
      if (platform == null || arch == null) {
        injectStatus.addTrace(
            ExecutionTraceStatus.ERROR,
            "Unsupported platform: " + platform + " (arch:" + arch + ")",
            ExecutionTraceAction.COMPLETE,
            agent);
      }
      String implantLocation;
      switch (platform) {
        case Windows -> {
          scriptName = this.crowdStrikeExecutorConfig.getWindowsScriptName();
          implantLocation =
              "$location="
                  + IMPLANT_LOCATION_WINDOWS
                  + ExecutorHelper.IMPLANT_BASE_NAME
                  + UUID.randomUUID()
                  + "\";md $location -ea 0;[Environment]::CurrentDirectory";
        }
        case Linux, MacOS -> {
          scriptName = this.crowdStrikeExecutorConfig.getUnixScriptName();
          implantLocation =
              "location="
                  + IMPLANT_LOCATION_UNIX
                  + ExecutorHelper.IMPLANT_BASE_NAME
                  + UUID.randomUUID()
                  + ";mkdir -p $location;filename=";
        }
        default -> throw new RuntimeException("Unsupported platform: " + platform);
      }

      String executorCommandKey = platform.name() + "." + arch.name();
      String command = injector.getExecutorCommands().get(executorCommandKey);

      command =
          "$agentID=[System.BitConverter]::ToString(((Get-ItemProperty 'HKLM:\\SYSTEM\\CurrentControlSet\\Services\\CSAgent\\Sim').AG)).ToLower() -replace '-','';"
              + command;
      command = replaceArgs(platform, command, inject.getId(), agent.getId());
      command = command.replace(agent.getId(), "$agentID");
      command =
          platform == Endpoint.PLATFORM_TYPE.Windows
              ? command.replaceFirst(
                  "\\$?x=.+location=.+;\\[Environment]::CurrentDirectory",
                  Matcher.quoteReplacement(implantLocation))
              : command.replaceFirst(
                  "\\$?x=.+location=.+;filename=", Matcher.quoteReplacement(implantLocation));

      commandEncoded =
          platform == Endpoint.PLATFORM_TYPE.Windows
              ? Base64.getEncoder().encodeToString(command.getBytes(StandardCharsets.UTF_8))
              : Base64.getEncoder().encodeToString(command.getBytes(StandardCharsets.UTF_8));
    }
    // TODO pagination in properties
    this.crowdStrikeExecutorClient.executeAction(
        List.of(agents.getFirst().getExternalReference()), scriptName, commandEncoded);
  }
}
