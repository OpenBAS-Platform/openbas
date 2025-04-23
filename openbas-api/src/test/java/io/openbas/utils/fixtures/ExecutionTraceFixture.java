package io.openbas.utils.fixtures;

import io.openbas.database.model.ExecutionTrace;
import io.openbas.database.model.ExecutionTraceAction;

public class ExecutionTraceFixture {

  public static ExecutionTrace createDefaultExecutionTraceStart() {
    return ExecutionTrace.getNewInfoTrace("Info", ExecutionTraceAction.START);
  }

  public static ExecutionTrace createDefaultExecutionTraceComplete() {
    return ExecutionTrace.getNewSuccessTrace("Success", ExecutionTraceAction.COMPLETE);
  }

  public static ExecutionTrace createDefaultExecutionTraceError() {
    return ExecutionTrace.getNewErrorTrace("Error", ExecutionTraceAction.COMPLETE);
  }
}
