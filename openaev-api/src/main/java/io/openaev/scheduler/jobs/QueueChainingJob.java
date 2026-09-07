package io.openaev.scheduler.jobs;

import static io.openaev.database.model.Tenant.DEFAULT_TENANT_UUID;

import io.openaev.context.TenantContext;
import io.openaev.context.TenantScopedTransaction;
import io.openaev.context.TxCtx;
import io.openaev.database.model.Step;
import io.openaev.database.model.StepDelayQueue;
import io.openaev.database.model.Workflow;
import io.openaev.database.repository.WorkflowRepository;
import io.openaev.rest.exception.ChainingException;
import io.openaev.service.chaining.StepDelayQueueService;
import io.openaev.service.chaining.StepService;
import io.openaev.service.chaining.WorkflowService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.DisallowConcurrentExecution;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
@DisallowConcurrentExecution
public class QueueChainingJob implements Job {
  private final StepDelayQueueService stepDelayQueueService;
  private final StepService stepService;
  private final WorkflowService workflowService;
  private final TenantScopedTransaction tenantTx;
  private final WorkflowRepository workflowRepository;

  /** Periodically processes the next eligible step from the delay queue. */
  @Override
  public void execute(JobExecutionContext jobExecutionContext) throws JobExecutionException {
    // The pop is one cross-tenant DELETE ... RETURNING, so it must run in its own all-tenants
    // transaction rather than under any single workflow tenant.
    List<StepDelayQueue> stepsDelayQueue =
        tenantTx.execute(TxCtx.allTenants(), stepDelayQueueService::popNextToProcess);
    if (stepsDelayQueue.isEmpty()) {
      return;
    }

    log.info("[Chaining] QueueChainingJob: processing {} delayed step(s)", stepsDelayQueue.size());

    for (StepDelayQueue stepDelayQueue : stepsDelayQueue) {
      // Each delayed row belongs to one workflow run. Scope each item separately so a failing
      // tenant rolls back only its own writes and cannot poison the rest of the batch.
      String tenantId = tenantIdOf(stepDelayQueue.getWorkflowRun());
      TenantContext.setCurrentTenant(tenantId);
      try {
        tenantTx.execute(TxCtx.forTenant(tenantId), () -> process(stepDelayQueue));
      } catch (UncheckedChainingException e) {
        log.error("[Chaining] Delay consume failed : {}", e.getCause().getMessage(), e.getCause());
      } finally {
        TenantContext.clearCurrentTenant();
      }
    }
  }

  private void process(StepDelayQueue stepDelayQueue) {
    try {
      if (workflowService.isWorkflowEnded(stepDelayQueue.getWorkflowRun().getId())) {
        log.info(
            "[Chaining] Ignoring step {} because workflow run {} has ended.",
            stepDelayQueue.getId(),
            stepDelayQueue.getWorkflowRun().getId());
        log.info(
            "[Chaining] Deleting all delayed steps for workflow run {} as it has ended.",
            stepDelayQueue.getWorkflowRun().getId());
        stepDelayQueueService.deleteAllByWorkflowRun(stepDelayQueue.getWorkflowRun());
        return;
      }

      List<Step> readySteps =
          stepService.createReadySteps(
              stepDelayQueue.getStepTemplate(),
              stepDelayQueue.getWorkflowRun(),
              stepDelayQueue.getInput(),
              0);

      stepService.enqueueReadySteps(readySteps, stepDelayQueue.getWorkflowRun());
    } catch (ChainingException e) {
      throw new UncheckedChainingException(e);
    }
  }

  private String tenantIdOf(Workflow workflowRun) {
    if (workflowRun == null || workflowRun.getId() == null) {
      return DEFAULT_TENANT_UUID;
    }
    return workflowRepository
        .findTenantIdByWorkflowId(workflowRun.getId())
        .orElse(DEFAULT_TENANT_UUID);
  }

  private static final class UncheckedChainingException extends RuntimeException {
    private UncheckedChainingException(ChainingException cause) {
      super(cause);
    }
  }
}
