package io.openex.injects.manual;

import io.openex.contract.Contract;
import io.openex.database.model.Execution;
import io.openex.execution.ExecutableInject;
import io.openex.execution.Injector;
import io.openex.model.Expectation;
import org.springframework.stereotype.Component;

import java.util.List;

@Component(ManualContract.TYPE)
public class ManualExecutor extends Injector {

  @Override
  public List<Expectation> process(Execution execution, ExecutableInject injection, Contract contract) {
    throw new UnsupportedOperationException("Manual inject cannot be executed");
  }
}
