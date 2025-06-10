package io.openbas.utils.fixtures.composers;

import io.openbas.database.model.InjectExecution;
import io.openbas.database.repository.InjectExecutionRepository;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class InjectStatusComposer extends ComposerBase<InjectExecution> {
  @Autowired private InjectExecutionRepository injectExecutionRepository;

  public class Composer extends InnerComposerBase<InjectExecution> {
    private final InjectExecution injectExecution;
    private final List<ExecutionTraceComposer.Composer> executionTracesComposer = new ArrayList<>();

    public Composer(InjectExecution injectExecution) {
      this.injectExecution = injectExecution;
    }

    public Composer withExecutionTraces(List<ExecutionTraceComposer.Composer> traces) {
      traces.forEach(trace -> withExecutionTrace(trace));
      return this;
    }

    public Composer withExecutionTrace(ExecutionTraceComposer.Composer executionTrace) {
      executionTracesComposer.add(executionTrace);
      executionTrace.get().setInjectExecution(this.injectExecution);
      this.injectExecution.getTraces().add(executionTrace.get());
      return this;
    }

    @Override
    public InjectStatusComposer.Composer persist() {
      injectExecutionRepository.save(injectExecution);
      executionTracesComposer.forEach(ExecutionTraceComposer.Composer::persist);
      return this;
    }

    @Override
    public InjectStatusComposer.Composer delete() {
      executionTracesComposer.forEach(ExecutionTraceComposer.Composer::delete);
      injectExecutionRepository.delete(injectExecution);
      return this;
    }

    @Override
    public InjectExecution get() {
      return this.injectExecution;
    }
  }

  public InjectStatusComposer.Composer forInjectStatus(InjectExecution injectExecution) {
    generatedItems.add(injectExecution);
    return new InjectStatusComposer.Composer(injectExecution);
  }
}
