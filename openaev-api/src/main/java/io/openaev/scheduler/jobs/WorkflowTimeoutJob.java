package io.openaev.scheduler.jobs;

import io.openaev.context.TenantContext;
import io.openaev.context.TenantScopedTransaction;
import io.openaev.context.TxCtx;
import io.openaev.database.model.Workflow;
import io.openaev.service.chaining.WorkflowEndService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.DisallowConcurrentExecution;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.springframework.stereotype.Component;

/**
 * Quartz job that periodically checks for running workflows whose timeout has expired and
 * force-completes them (workflow → END, active steps → END, delay queue entries removed).
 */
@Component
@RequiredArgsConstructor
@Slf4j
@DisallowConcurrentExecution
public class WorkflowTimeoutJob implements Job {

  private final WorkflowEndService workflowEndService;

  /**
   * MT scoping for this job (mirrors {@code StepEventService#handleReadyStepEvent}, #6357). {@code
   * findAllExpiredRunWorkflows()} itself stays unscoped: it must see every tenant's expired runs in
   * one pass. But {@code forceCompleteWorkflowByTimeout()} ends a single run and reads/writes v1
   * {@code @Filter} entities (asset agent jobs, workflow states, simulation) scoped by the
   * thread-local {@link TenantContext}, which this background thread carries none of by default.
   * Each expired workflow is therefore completed in its own top-level transaction, scoped to its
   * run's tenant, set-then-finally-clear, so one workflow's tenant scope (and failure) never leaks
   * into the next.
   */
  private final TenantScopedTransaction tenantTx;

  @Override
  public void execute(JobExecutionContext jobExecutionContext) {
    List<Workflow> expiredWorkflows = workflowEndService.findAllExpiredRunWorkflows();
    if (expiredWorkflows.isEmpty()) {
      return;
    }

    log.info(
        "[Chaining] Found {} expired workflow run(s) to force-complete.", expiredWorkflows.size());

    for (Workflow workflow : expiredWorkflows) {
      // RUN workflows always have a simulation (only TEMPLATE runs can be null).
      // TODO: read tenantId directly from Workflow once it carries its own tenant_id.
      String tenantId = workflow.getSimulation().getTenant().getId();
      TenantContext.setCurrentTenant(tenantId);
      try {
        tenantTx.execute(
            TxCtx.forTenant(tenantId),
            () -> workflowEndService.forceCompleteWorkflowByTimeout(workflow));
      } catch (Exception e) {
        log.error(
            "[Chaining] Failed to force-complete expired workflow run {}. Will retry on next cycle.",
            workflow.getId(),
            e);
      } finally {
        TenantContext.clearCurrentTenant();
      }
    }
  }
}
