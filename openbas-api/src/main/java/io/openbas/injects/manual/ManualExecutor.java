package io.openbas.injects.manual;

import io.openbas.database.model.Execution;
import io.openbas.execution.ExecutableInject;
import io.openbas.execution.Injector;
import io.openbas.model.Expectation;
import jakarta.validation.constraints.NotNull;
import org.springframework.stereotype.Component;

import java.util.List;

@Component(ManualContract.TYPE)
public class ManualExecutor extends Injector {

  @Override
  public List<Expectation> process(
      @NotNull final Execution execution,
      @NotNull final ExecutableInject injection) {
    throw new UnsupportedOperationException("Manual inject cannot be executed");
  }
}
