package io.openaev.scheduler.jobs;

import io.openaev.context.TenantContext;
import io.openaev.context.TenantScopedTransaction;
import io.openaev.context.TxCtx;
import io.openaev.database.model.Step;
import io.openaev.database.model.StepDelayQueue;
import io.openaev.rest.exception.ChainingException;
import io.openaev.service.chaining.StepDelayQueueService;
import io.openaev.service.chaining.StepService;
import io.openaev.service.chaining.WorkflowEndService;
import io.openaev.service.chaining.WorkflowService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.DisallowConcurrentExecution;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;

@Component
@RequiredArgsConstructor
@Slf4j
@DisallowConcurrentExecution
public class QueueChainingJob implements Job {
  private final StepDelayQueueService stepDelayQueueService;
  private final StepService stepService;
  private final WorkflowService workflowService;
  private final TransactionTemplate transactionTemplate;

  /**
   * MT scoping for this job (mirrors {@code StepEventService#handleReadyStepEvent}, #6357). {@code
   * popNextPerWorkflowRun()} claims delay-queue entries across ALL tenants in one atomic {@code
   * DELETE...RETURNING}, so the pop itself cannot be tenant-scoped. Each popped item is then
   * processed in its own {@code REQUIRES_NEW} transaction scoped to its run's tenant - both the v2
   * GUC (this primitive) and the v1 {@link TenantContext} bridge, since ending a run reads/writes
   * v1 {@code @Filter} entities (asset agent jobs, workflow states, simulation). {@code
   * REQUIRES_NEW} keeps one item's tenant scope from leaking into the next; an exception left
   * uncaught here still escapes to the outer {@code executeWithoutResult} below, rolling back the
   * pop so the item is retried, exactly as before this scoping was added.
   */
  private final TenantScopedTransaction tenantTx;

  /** Periodically processes the next eligible step from the delay queue. */
  @Override
  public void execute(JobExecutionContext jobExecutionContext) throws JobExecutionException {
    // Pop and process inside the same transaction so that if processing fails,
    // the DELETE is rolled back and the entry is not lost.
    transactionTemplate.executeWithoutResult(
        status -> {
          List<StepDelayQueue> stepsDelayQueue = stepDelayQueueService.popNextToProcess();
          if (stepsDelayQueue.isEmpty()) return;

          log.info(
              "[Chaining] QueueChainingJob: processing {} delayed step(s)", stepsDelayQueue.size());

          for (StepDelayQueue stepDelayQueue : stepsDelayQueue) {
            processDelayedStep(stepDelayQueue);
          }
        });
  }

  private void processDelayedStep(StepDelayQueue stepDelayQueue) {
    String tenantId = stepDelayQueue.getWorkflowRun().getSimulation().getTenant().getId();
    TenantContext.setCurrentTenant(tenantId);
    try {
      tenantTx.executeNew(TxCtx.forTenant(tenantId), () -> runDelayedStep(stepDelayQueue));
    } finally {
      TenantContext.clearCurrentTenant();
    }
  }

  private void runDelayedStep(StepDelayQueue stepDelayQueue) {
    // Guard: ignore if workflow run has already ended (e.g. timeout).
    if (workflowService.isWorkflowEnded(stepDelayQueue.getWorkflowRun().getId())) {
      log.info(
          "[Chaining] Ignoring step {} because workflow run {} has ended.",
          stepDelayQueue.getId(),
          stepDelayQueue.getWorkflowRun().getId());
      log.info(
          "[Chaining] Deleting all delayed steps for workflow run {} as it has ended.",
          stepDelayQueue.getWorkflowRun().getId());
      stepDelayQueueService.deleteAllByWorkflowRun(
          stepDelayQueue.getWorkflowRun(), WorkflowEndService.WORKFLOW_END_CAUSE.NO_MORE_PROGRESS);
      return;
    }

    try {
      // Create new READY step(s) from the template.
      // Rate limiting is handled inside createReadySteps at the batch level:
      // batches that exceed the rate limit are re-pushed into the delay queue.
      List<Step> readySteps =
          stepService.createReadySteps(
              stepDelayQueue.getStepTemplate(),
              stepDelayQueue.getWorkflowRun(),
              stepDelayQueue.getInput(),
              0);

      stepService.enqueueReadySteps(readySteps, stepDelayQueue.getWorkflowRun());
    } catch (ChainingException e) {
      log.error("[Chaining] Delay consume failed : {}", e.getMessage(), e);
    }
  }
}
