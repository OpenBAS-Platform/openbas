package io.openbas.executors.tanium.service;

import io.openbas.database.model.Endpoint;
import io.openbas.executors.tanium.client.TaniumExecutorClient;
import io.openbas.executors.tanium.config.TaniumExecutorConfig;
import io.openbas.service.AgentService;
import java.util.Base64;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class TaniumGarbageCollectorService implements Runnable {
  // Clean payloads older than 24 hours
  private static final String WINDOWS_COMMAND_LINE =
      "Get-ChildItem -Path \"C:\\Program Files (x86)\\Filigran\\OBAS Agent\\payloads\",\"C:\\Program Files (x86)\\Filigran\\OBAS Agent\\runtimes\" -Directory -Recurse | Where-Object {$_.CreationTime -lt (Get-Date).AddHours(-24)} | Remove-Item -Recurse -Force";
  private static final String UNIX_COMMAND_LINE =
      "find /opt/openbas-agent/payloads /opt/openbas-agent/runtimes -type d -mmin +1440 -exec rm -rf {} + 2>/dev/null";
  private final TaniumExecutorConfig config;
  private final TaniumExecutorClient client;
  private final AgentService agentService;

  @Autowired
  public TaniumGarbageCollectorService(
      TaniumExecutorConfig config, TaniumExecutorClient client, AgentService agentService) {
    this.config = config;
    this.client = client;
    this.agentService = agentService;
  }

  @Override
  public void run() {
    log.info("Running Tanium executor garbage collector...");
    List<io.openbas.database.model.Agent> agents =
        this.agentService.getAgentsByExecutorType(TaniumExecutorService.TANIUM_EXECUTOR_TYPE);
    log.info("Running Tanium executor garbage collector on " + agents.size() + " agents");
    agents.forEach(
        agent -> {
          Endpoint endpoint = (Endpoint) agent.getAsset();
          switch (endpoint.getPlatform()) {
            case Windows -> {
              log.info("Sending Windows command line to " + endpoint.getName());
              this.client.executeAction(
                  agent.getExternalReference(),
                  this.config.getWindowsPackageId(),
                  Base64.getEncoder().encodeToString(WINDOWS_COMMAND_LINE.getBytes()));
            }
            case Linux, MacOS -> {
              log.info("Sending Unix command line to " + endpoint.getName());
              this.client.executeAction(
                  agent.getExternalReference(),
                  this.config.getUnixPackageId(),
                  Base64.getEncoder().encodeToString(UNIX_COMMAND_LINE.getBytes()));
            }
          }
        });
  }
}
