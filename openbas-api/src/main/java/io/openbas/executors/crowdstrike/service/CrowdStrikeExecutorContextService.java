package io.openbas.executors.crowdstrike.service;

import static io.openbas.executors.ExecutorHelper.replaceArgs;
import static io.openbas.executors.crowdstrike.service.CrowdStrikeExecutorService.CROWDSTRIKE_EXECUTOR_NAME;

import io.openbas.database.model.*;
import io.openbas.executors.ExecutorContextService;
import io.openbas.executors.ExecutorHelper;
import io.openbas.executors.crowdstrike.client.CrowdStrikeExecutorClient;
import io.openbas.executors.crowdstrike.config.CrowdStrikeExecutorConfig;
import io.openbas.executors.crowdstrike.model.CrowdStrikeAction;
import jakarta.validation.constraints.NotNull;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
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

  private static final String AGENT_ID_VARIABLE = "$agentID";
  private static final String WINDOWS_EXTERNAL_REFERENCE =
      "$agentID=[System.BitConverter]::ToString(((Get-ItemProperty 'HKLM:\\SYSTEM\\CurrentControlSet\\Services\\CSAgent\\Sim').AG)).ToLower() -replace '-','';";
  private static final String LINUX_EXTERNAL_REFERENCE =
      "agentID=$(sudo /opt/CrowdStrike/falconctl -g --aid | sed 's/aid=\"//g' | sed 's/\".//g');";
  private static final String MAC_EXTERNAL_REFERENCE =
      "agentID=$(sudo /Applications/Falcon.app/Contents/Resources/falconctl stats | grep agentID | sed 's/agentID: //g' | tr '[:upper:]' '[:lower:]' | sed 's/-//g');";

  private final CrowdStrikeExecutorConfig crowdStrikeExecutorConfig;
  private final CrowdStrikeExecutorClient crowdStrikeExecutorClient;

  public void launchExecutorSubprocess(
      @NotNull final Inject inject,
      @NotNull final Endpoint assetEndpoint,
      @NotNull final Agent agent) {}

  public void launchBatchExecutorSubprocess(
      Inject inject, List<Agent> agents, InjectStatus injectStatus) throws InterruptedException {
    if (!this.crowdStrikeExecutorConfig.isEnable()) {
      throw new RuntimeException("Fatal error: CrowdStrike executor is not enabled");
    }

    Injector injector =
        inject
            .getInjectorContract()
            .map(InjectorContract::getInjector)
            .orElseThrow(
                () -> new UnsupportedOperationException("Inject does not have a contract"));

    manageWithoutPlatformAgents(agents, injectStatus);
    List<CrowdStrikeAction> actions = new ArrayList<>();
    // Set implant script for Windows CS agents
    actions.addAll(
        getWindowsActions(
            agents.stream()
                .filter(
                    agent ->
                        ((Endpoint) agent.getAsset())
                            .getPlatform()
                            .equals(Endpoint.PLATFORM_TYPE.Windows))
                .toList(),
            injector,
            inject.getId()));
    // Set implant script for Linux CS agents
    actions.addAll(
        setLinuxActions(
            agents.stream()
                .filter(
                    agent ->
                        ((Endpoint) agent.getAsset())
                            .getPlatform()
                            .equals(Endpoint.PLATFORM_TYPE.Linux))
                .toList(),
            injector,
            inject.getId()));
    // Set implant script for Mac CS agents
    actions.addAll(
        setMacActions(
            agents.stream()
                .filter(
                    agent ->
                        ((Endpoint) agent.getAsset())
                            .getPlatform()
                            .equals(Endpoint.PLATFORM_TYPE.MacOS))
                .toList(),
            injector,
            inject.getId()));
    // Launch payloads with CS API
    executeActions(actions);
  }

  private void manageWithoutPlatformAgents(List<Agent> agents, InjectStatus injectStatus) {
    List<Agent> withoutPlatformAgents =
        agents.stream()
            .filter(
                agent ->
                    ((Endpoint) agent.getAsset()).getPlatform() == null
                        || ((Endpoint) agent.getAsset()).getPlatform()
                            == Endpoint.PLATFORM_TYPE.Unknown
                        || ((Endpoint) agent.getAsset()).getArch() == null)
            .toList();
    agents.removeAll(withoutPlatformAgents);
    // Agents with no platform or unknown platform
    for (Agent agent : withoutPlatformAgents) {
      injectStatus.addTrace(
          ExecutionTraceStatus.ERROR,
          "Unsupported platform: "
              + ((Endpoint) agent.getAsset()).getPlatform()
              + " (arch:"
              + ((Endpoint) agent.getAsset()).getArch()
              + ")",
          ExecutionTraceAction.COMPLETE,
          agent);
    }
  }

  private void executeActions(List<CrowdStrikeAction> actions) throws InterruptedException {
    for (CrowdStrikeAction action : actions) {
      int paginationLimit = this.crowdStrikeExecutorConfig.getApiBatchExecutionActionPagination();
      // Pagination with 1s wait if needed because each implant will call OpenBAS API to set traces
      if (action.getAgents().size() > paginationLimit) {
        int numberOfExecution = Math.ceilDiv(action.getAgents().size(), paginationLimit);
        int fromIndex = 0;
        int toIndex = paginationLimit;
        for (int callNumber = 0; callNumber < numberOfExecution; callNumber += 1) {
          this.crowdStrikeExecutorClient.executeAction(
              action.getAgents().subList(fromIndex, toIndex).stream().map(Agent::getId).toList(),
              action.getScriptName(),
              action.getCommandEncoded());
          fromIndex = toIndex;
          toIndex = Math.min(action.getAgents().size(), fromIndex + paginationLimit);
          Thread.sleep(1000);
        }
      } else {
        this.crowdStrikeExecutorClient.executeAction(
            action.getAgents().stream().map(Agent::getId).toList(),
            action.getScriptName(),
            action.getCommandEncoded());
        Thread.sleep(1000);
      }
    }
  }

  private List<CrowdStrikeAction> getWindowsActions(
      List<Agent> agents, Injector injector, String injectId) {
    List<CrowdStrikeAction> actions = new ArrayList<>();
    if (!agents.isEmpty()) {
      CrowdStrikeAction actionWindows = new CrowdStrikeAction();
      actionWindows.setScriptName(this.crowdStrikeExecutorConfig.getWindowsScriptName());
      String implantLocation =
          "$location="
              + IMPLANT_LOCATION_WINDOWS
              + ExecutorHelper.IMPLANT_BASE_NAME
              + UUID.randomUUID()
              + "\";md $location -ea 0;[Environment]::CurrentDirectory";
      Endpoint.PLATFORM_TYPE platform = Endpoint.PLATFORM_TYPE.Windows;
      // x86_64 by default in the register because CS API doesn't provide the platform architecture
      String executorCommandKey = platform.name() + "." + Endpoint.PLATFORM_ARCH.x86_64.name();
      String command = injector.getExecutorCommands().get(executorCommandKey);
      command = WINDOWS_EXTERNAL_REFERENCE + command;
      command = replaceArgs(platform, command, injectId, AGENT_ID_VARIABLE);
      command =
          command.replaceFirst(
              "\\$?x=.+location=.+;\\[Environment]::CurrentDirectory",
              Matcher.quoteReplacement(implantLocation));
      actionWindows.setCommandEncoded(
          Base64.getEncoder().encodeToString(command.getBytes(StandardCharsets.UTF_8)));
      actionWindows.setAgents(agents);
      actions.add(actionWindows);
    }
    return actions;
  }

  private List<CrowdStrikeAction> setLinuxActions(
      List<Agent> agents, Injector injector, String injectId) {
    List<CrowdStrikeAction> actions = new ArrayList<>();
    if (!agents.isEmpty()) {
      CrowdStrikeAction actionLinux = new CrowdStrikeAction();
      actionLinux.setScriptName(this.crowdStrikeExecutorConfig.getUnixScriptName());
      actionLinux.setCommandEncoded(
          getUnixCommand(
              Endpoint.PLATFORM_TYPE.Linux, injector, injectId, LINUX_EXTERNAL_REFERENCE));
      actionLinux.setAgents(agents);
      actions.add(actionLinux);
    }
    return actions;
  }

  private List<CrowdStrikeAction> setMacActions(
      List<Agent> agents, Injector injector, String injectId) {
    List<CrowdStrikeAction> actions = new ArrayList<>();
    if (!agents.isEmpty()) {
      CrowdStrikeAction actionMac = new CrowdStrikeAction();
      actionMac.setScriptName(this.crowdStrikeExecutorConfig.getUnixScriptName());
      actionMac.setCommandEncoded(
          getUnixCommand(Endpoint.PLATFORM_TYPE.MacOS, injector, injectId, MAC_EXTERNAL_REFERENCE));
      actionMac.setAgents(agents);
      actions.add(actionMac);
    }
    return actions;
  }

  private String getUnixCommand(
      Endpoint.PLATFORM_TYPE platform,
      Injector injector,
      String injectId,
      String externalReferenceVariable) {
    String implantLocation =
        "location="
            + IMPLANT_LOCATION_UNIX
            + ExecutorHelper.IMPLANT_BASE_NAME
            + UUID.randomUUID()
            + ";mkdir -p $location;filename=";
    // x86_64 by default in the register because CS API doesn't provide the platform architecture
    String executorCommandKey = platform.name() + "." + Endpoint.PLATFORM_ARCH.x86_64.name();
    String command = injector.getExecutorCommands().get(executorCommandKey);
    command = externalReferenceVariable + command;
    command = replaceArgs(platform, command, injectId, AGENT_ID_VARIABLE);
    command =
        command.replaceFirst(
            "\\$?x=.+location=.+;filename=", Matcher.quoteReplacement(implantLocation));
    return Base64.getEncoder().encodeToString(command.getBytes(StandardCharsets.UTF_8));
  }
}
