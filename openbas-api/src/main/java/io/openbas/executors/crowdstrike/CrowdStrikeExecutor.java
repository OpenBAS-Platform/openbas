package io.openbas.executors.crowdstrike;

import io.openbas.executors.ExecutorService;
import io.openbas.executors.crowdstrike.client.CrowdStrikeExecutorClient;
import io.openbas.executors.crowdstrike.config.CrowdStrikeExecutorConfig;
import io.openbas.executors.crowdstrike.service.CrowdStrikeExecutorService;
import io.openbas.service.AgentService;
import io.openbas.service.AssetGroupService;
import io.openbas.service.EndpointService;
import jakarta.annotation.PostConstruct;
import java.time.Duration;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class CrowdStrikeExecutor {

  private final CrowdStrikeExecutorConfig config;
  private final ThreadPoolTaskScheduler taskScheduler;
  private final CrowdStrikeExecutorClient client;
  private final EndpointService endpointService;
  private final ExecutorService executorService;
  private final AgentService agentService;
  private final AssetGroupService assetGroupService;

  @PostConstruct
  public void init() {
    CrowdStrikeExecutorService service =
        new CrowdStrikeExecutorService(
            this.executorService,
            this.client,
            this.config,
            this.endpointService,
            this.agentService,
            this.assetGroupService);
    if (this.config.isEnable()) {
      // Get and create/update the Crowdstrike asset groups, assets and agents each 20 minutes
      // (by default)
      this.taskScheduler.scheduleAtFixedRate(
          service, Duration.ofSeconds(this.config.getApiRegisterInterval()));
    }
  }
}
