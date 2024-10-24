package io.openbas.injectors.manual;

import io.openbas.database.model.Execution;
import io.openbas.execution.ExecutableInject;
import io.openbas.execution.Injector;
import io.openbas.model.ExecutionProcess;
import jakarta.validation.constraints.NotNull;
import org.springframework.stereotype.Component;

@Component(ManualContract.TYPE)
public class ManualExecutor extends Injector {

  @Override
  public ExecutionProcess process(
      @NotNull final Execution execution, @NotNull final ExecutableInject injection) {
    throw new UnsupportedOperationException("Manual inject cannot be executed");
  }
}
