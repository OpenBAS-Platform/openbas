package io.openbas.injects.manual;

import io.openbas.contract.Contract;
import io.openbas.database.model.Execution;
import io.openbas.execution.ExecutableInject;
import io.openbas.execution.Injector;
import io.openbas.model.Expectation;
import org.springframework.stereotype.Component;

import jakarta.validation.constraints.NotNull;
import java.util.List;

@Component(ManualContract.TYPE)
public class ManualExecutor extends Injector {

  @Override
  public List<Expectation> process(
      @NotNull final Execution execution,
      @NotNull final ExecutableInject injection,
      @NotNull final Contract contract) {
    throw new UnsupportedOperationException("Manual inject cannot be executed");
  }
}
