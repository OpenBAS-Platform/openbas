package io.openbas.injectors.openbas;

import static io.openbas.database.model.InjectStatusExecution.traceError;

import io.openbas.asset.AssetGroupService;
import io.openbas.database.model.*;
import io.openbas.database.repository.InjectRepository;
import io.openbas.execution.ExecutableInject;
import io.openbas.execution.Injector;
import io.openbas.model.ExecutionProcess;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.stereotype.Component;

@Component(OpenBASImplantContract.TYPE)
@RequiredArgsConstructor
@Log
public class OpenBASImplantExecutor extends Injector {

  private final AssetGroupService assetGroupService;
  private final InjectRepository injectRepository;

  @Override
  public ExecutionProcess process(Execution execution, ExecutableInject injection)
      throws Exception {
    Inject inject =
        this.injectRepository.findById(injection.getInjection().getInject().getId()).orElseThrow();
    Map<Asset, Boolean> assets =
        assetGroupService.resolveAllAssets(injection.getInjection().getInject());

    // Check assets target
    if (assets.isEmpty()) {
      execution.addTrace(
          traceError(
              "Found 0 asset to execute the ability on (likely this inject does not have any target or the targeted asset is inactive and has been purged)"));
    }

    assets.forEach(
        (asset, isInGroup) -> {
          Optional<InjectorContract> contract = inject.getInjectorContract();

          if (contract.isPresent()) {
            Payload payload = contract.get().getPayload();
            if (payload == null) {
              log.info(
                  String.format("No payload for inject %s was found, skipping", inject.getId()));
              return;
            }
            execution.setExpectedCount(
                payload.getPrerequisites().size()
                    + (payload.getCleanupCommand() != null ? 1 : 0)
                    + payload.getNumberOfActions());
          }
        });

    return new ExecutionProcess(true);
  }
}
