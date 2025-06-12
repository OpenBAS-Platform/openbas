package io.openbas.utils.fixtures.composers;

import io.openbas.database.model.InjectTestExecution;
import io.openbas.database.repository.InjectTestStatusRepository;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class InjectTestStatusComposer extends ComposerBase<InjectTestExecution> {

  @Autowired private InjectTestStatusRepository injectTestStatusRepository;

  public class Composer extends InnerComposerBase<InjectTestExecution> {

    private final InjectTestExecution injectTestExecution;
    private final List<ExecutionTraceComposer.Composer> executionTracesComposer = new ArrayList<>();

    public Composer(InjectTestExecution injectTestExecution) {
      this.injectTestExecution = injectTestExecution;
    }

    public Composer withExecutionTraces(List<ExecutionTraceComposer.Composer> traces) {
      traces.forEach(trace -> withExecutionTrace(trace));
      return this;
    }

    public Composer withExecutionTrace(ExecutionTraceComposer.Composer executionTrace) {
      executionTracesComposer.add(executionTrace);
      executionTrace.get().setInjectTestExecution(this.injectTestExecution);
      this.injectTestExecution.getTraces().add(executionTrace.get());
      return this;
    }

    @Override
    public InjectTestStatusComposer.Composer persist() {
      injectTestStatusRepository.save(injectTestExecution);
      executionTracesComposer.forEach(ExecutionTraceComposer.Composer::persist);
      return this;
    }

    @Override
    public InjectTestStatusComposer.Composer delete() {
      executionTracesComposer.forEach(ExecutionTraceComposer.Composer::delete);
      injectTestStatusRepository.delete(injectTestExecution);
      return this;
    }

    @Override
    public InjectTestExecution get() {
      return this.injectTestExecution;
    }
  }

  public InjectTestStatusComposer.Composer forInjectTestStatus(
      InjectTestExecution InjectTestStatus) {
    generatedItems.add(InjectTestStatus);
    return new InjectTestStatusComposer.Composer(InjectTestStatus);
  }
}
