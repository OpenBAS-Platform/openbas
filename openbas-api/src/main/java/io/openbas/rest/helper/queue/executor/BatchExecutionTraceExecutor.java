package io.openbas.rest.helper.queue.executor;

import io.openbas.rest.inject.form.InjectExecutionCallback;
import io.openbas.rest.inject.service.BatchingInjectStatusService;
import jakarta.transaction.Transactional;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Transactional(Transactional.TxType.REQUIRED)
public class BatchExecutionTraceExecutor {

  private final BatchingInjectStatusService batchingInjectStatusService;

  public void handleInjectExecutionCallbackList(
      List<InjectExecutionCallback> injectExecutionCallbacks) {
    batchingInjectStatusService.handleInjectExecutionCallbackList(injectExecutionCallbacks);
  }
}
