package io.openbas.execution;

import io.openbas.asset.AssetGroupService;
import io.openbas.database.model.*;
import io.openbas.database.model.Executor;
import io.openbas.database.repository.InjectStatusRepository;
import io.openbas.executors.caldera.config.CalderaExecutorConfig;
import io.openbas.executors.caldera.service.CalderaExecutorContextService;
import io.openbas.executors.openbas.service.OpenBASExecutorContextService;
import io.openbas.executors.tanium.config.TaniumExecutorConfig;
import io.openbas.executors.tanium.service.TaniumExecutorContextService;
import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.logging.Level;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
@Log
public class ExecutionExecutorService {
  private final AssetGroupService assetGroupService;
  private final CalderaExecutorConfig calderaExecutorConfig;
  private final CalderaExecutorContextService calderaExecutorContextService;
  private final TaniumExecutorConfig taniumExecutorConfig;
  private final TaniumExecutorContextService taniumExecutorContextService;
  private final OpenBASExecutorContextService openBASExecutorContextService;
  private final InjectStatusRepository injectStatusRepository;

  public ExecutableInject launchExecutorContext(ExecutableInject executableInject, Inject inject)
      throws InterruptedException {
    // First, get the assets of this injects
    List<Asset> assets =
        Stream.concat(
                inject.getAssets().stream(),
                inject.getAssetGroups().stream()
                    .flatMap(
                        assetGroup ->
                            this.assetGroupService
                                .assetsFromAssetGroup(assetGroup.getId())
                                .stream()))
            .toList();
    InjectStatus injectStatus =
        inject.getStatus().orElseThrow(() -> new IllegalArgumentException("Status should exists"));
    AtomicBoolean atLeastOneExecution = new AtomicBoolean(false);
    assets.forEach(
        asset -> {
          try {
            launchExecutorContextForAsset(inject, asset);
            atLeastOneExecution.set(true);
          } catch (RuntimeException e) {
            ExecutionTraceStatus traceStatus =
                e.getMessage().startsWith("Asset error")
                    ? ExecutionTraceStatus.ASSET_INACTIVE
                    : ExecutionTraceStatus.ERROR;

            injectStatus
                .getTraces()
                .add(InjectStatusExecution.traceError(traceStatus, e.getMessage()));
            this.injectStatusRepository.save(injectStatus);
          }
        });
    // if launchExecutorContextForAsset fail for every assets we throw to manually set injectStatus
    // to error
    if (!atLeastOneExecution.get()) {
      throw new ExecutionExecutorException("No asset executed");
    }

    return executableInject;
  }

  private void launchExecutorContextForAsset(Inject inject, Asset asset) {
    Endpoint assetEndpoint = (Endpoint) Hibernate.unproxy(asset);
    Executor executor = assetEndpoint.getExecutor();
    if (executor == null) {
      log.log(Level.SEVERE, "Cannot find the executor for the asset " + assetEndpoint.getName());
    } else if (!assetEndpoint.getActive()) {
      throw new RuntimeException("Asset error: " + assetEndpoint.getName() + " is inactive");
    } else {
      switch (executor.getType()) {
        case "openbas_caldera" -> {
          if (!this.calderaExecutorConfig.isEnable()) {
            throw new RuntimeException("Fatal error: Caldera executor is not enabled");
          }
          this.calderaExecutorContextService.launchExecutorSubprocess(inject, assetEndpoint);
        }
        case "openbas_tanium" -> {
          if (!this.taniumExecutorConfig.isEnable()) {
            throw new RuntimeException("Fatal error: Tanium executor is not enabled");
          }
          this.taniumExecutorContextService.launchExecutorSubprocess(inject, assetEndpoint);
        }
        case "openbas_agent" ->
            this.openBASExecutorContextService.launchExecutorSubprocess(inject, assetEndpoint);
        default ->
            throw new RuntimeException("Fatal error: Unsupported executor " + executor.getType());
      }
    }
  }
}
