package io.openbas.injectors.lade;

import static io.openbas.database.model.InjectStatusExecution.traceError;
import static io.openbas.database.model.InjectStatusExecution.traceInfo;

import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.database.model.Execution;
import io.openbas.database.model.Inject;
import io.openbas.database.model.InjectorContract;
import io.openbas.execution.ExecutableInject;
import io.openbas.executors.Injector;
import io.openbas.injectors.lade.service.LadeService;
import io.openbas.model.ExecutionProcess;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component(LadeContract.TYPE)
@RequiredArgsConstructor
public class LadeExecutor extends Injector {

  private final LadeService ladeService;

  @Override
  public ExecutionProcess process(
      @NotNull final Execution execution, @NotNull final ExecutableInject injection) {
    Inject inject = injection.getInjection().getInject();
    String bundleIdentifier = ""; // contract.getContext().get("bundle_identifier");
    String ladeType = ""; // contract.getContext().get("lade_type");
    ObjectNode content = inject.getContent();
    try {
      String actionWorkflowId;
      final InjectorContract injectorContract =
          inject
              .getInjectorContract()
              .orElseThrow(
                  () -> new UnsupportedOperationException("Inject does not have a contract"));
      switch (ladeType) {
        case "action" ->
            actionWorkflowId =
                ladeService.executeAction(bundleIdentifier, injectorContract.getId(), content);
        case "scenario" ->
            actionWorkflowId =
                ladeService.executeScenario(bundleIdentifier, injectorContract.getId(), content);
        default -> throw new UnsupportedOperationException(ladeType + " not supported");
      }
      String message = "Lade " + ladeType + " sent with workflow (" + actionWorkflowId + ")";
      execution.addTrace(traceInfo(message, List.of(actionWorkflowId)));
    } catch (Exception e) {
      execution.addTrace(traceError(e.getMessage()));
    }
    return new ExecutionProcess(true);
  }
}
