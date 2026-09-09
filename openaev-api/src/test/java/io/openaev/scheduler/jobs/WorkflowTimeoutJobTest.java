package io.openaev.scheduler.jobs;

import static org.mockito.Mockito.*;

import io.openaev.context.TenantContext;
import io.openaev.context.TenantScopedTransaction;
import io.openaev.context.TxCtx;
import io.openaev.database.model.Exercise;
import io.openaev.database.model.Tenant;
import io.openaev.database.model.Workflow;
import io.openaev.database.model.WorkflowStatus;
import io.openaev.service.chaining.WorkflowEndService;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.quartz.JobExecutionContext;

@ExtendWith(MockitoExtension.class)
@DisplayName("WorkflowTimeoutJob Tests")
class WorkflowTimeoutJobTest {

  @Mock private WorkflowEndService workflowEndService;
  @Mock private TenantScopedTransaction tenantScopedTransaction;
  @Mock private JobExecutionContext jobExecutionContext;

  @InjectMocks private WorkflowTimeoutJob workflowTimeoutJob;

  @AfterEach
  void tearDown() {
    TenantContext.clearCurrentTenant();
  }

  /** Stubs the primitive to actually run the work, scoped in {@code tenantTx.execute(...)}. */
  private void stubTenantScopedTransactionToRunWork() {
    lenient()
        .doAnswer(
            invocation -> {
              Runnable work = invocation.getArgument(1);
              work.run();
              return null;
            })
        .when(tenantScopedTransaction)
        .execute(any(TxCtx.class), any(Runnable.class));
  }

  @Nested
  @DisplayName("execute")
  class ExecuteTests {

    @Test
    @DisplayName("given_noExpiredWorkflows_should_doNothing")
    void given_noExpiredWorkflows_should_doNothing() {
      // Arrange
      when(workflowEndService.findAllExpiredRunWorkflows()).thenReturn(Collections.emptyList());

      // Act
      workflowTimeoutJob.execute(jobExecutionContext);

      // Assert
      verify(workflowEndService).findAllExpiredRunWorkflows();
      verify(workflowEndService, never()).forceCompleteWorkflowByTimeout(any());
    }

    @Test
    @DisplayName("given_singleExpiredWorkflow_should_forceCompleteIt")
    void given_singleExpiredWorkflow_should_forceCompleteIt() {
      // Arrange
      stubTenantScopedTransactionToRunWork();
      Workflow expiredWorkflow = buildRunWorkflow("tenant-1");
      when(workflowEndService.findAllExpiredRunWorkflows()).thenReturn(List.of(expiredWorkflow));

      // Act
      workflowTimeoutJob.execute(jobExecutionContext);

      // Assert
      verify(workflowEndService).forceCompleteWorkflowByTimeout(expiredWorkflow);
    }

    @Test
    @DisplayName("given_expiredWorkflow_should_scopeTenantContextToItsSimulationTenant")
    void given_expiredWorkflow_should_scopeTenantContextToItsSimulationTenant() {
      // Arrange
      String tenantId = "tenant-42";
      Workflow expiredWorkflow = buildRunWorkflow(tenantId);
      when(workflowEndService.findAllExpiredRunWorkflows()).thenReturn(List.of(expiredWorkflow));
      doAnswer(
              invocation -> {
                // Assert (inside the scoped work): TenantContext carries the run's tenant.
                org.junit.jupiter.api.Assertions.assertEquals(
                    tenantId, TenantContext.getCurrentTenant());
                Runnable work = invocation.getArgument(1);
                work.run();
                return null;
              })
          .when(tenantScopedTransaction)
          .execute(eq(TxCtx.forTenant(tenantId)), any(Runnable.class));

      // Act
      workflowTimeoutJob.execute(jobExecutionContext);

      // Assert: cleared after the job runs so it never leaks to the next Quartz fire.
      verify(tenantScopedTransaction).execute(eq(TxCtx.forTenant(tenantId)), any(Runnable.class));
      org.junit.jupiter.api.Assertions.assertFalse(TenantContext.hasCurrentTenant());
    }

    @Test
    @DisplayName("given_multipleExpiredWorkflows_should_forceCompleteAll")
    void given_multipleExpiredWorkflows_should_forceCompleteAll() {
      // Arrange
      stubTenantScopedTransactionToRunWork();
      Workflow expired1 = buildRunWorkflow("tenant-1");
      Workflow expired2 = buildRunWorkflow("tenant-2");
      when(workflowEndService.findAllExpiredRunWorkflows()).thenReturn(List.of(expired1, expired2));

      // Act
      workflowTimeoutJob.execute(jobExecutionContext);

      // Assert
      verify(workflowEndService).forceCompleteWorkflowByTimeout(expired1);
      verify(workflowEndService).forceCompleteWorkflowByTimeout(expired2);
    }

    @Test
    @DisplayName(
        "given_firstWorkflowFailsForceComplete_should_continueProcessingRemainingWorkflows")
    void given_firstWorkflowFailsForceComplete_should_continueProcessingRemainingWorkflows() {
      // Arrange
      stubTenantScopedTransactionToRunWork();
      Workflow failingWorkflow = buildRunWorkflow("tenant-1");
      Workflow successWorkflow = buildRunWorkflow("tenant-2");
      when(workflowEndService.findAllExpiredRunWorkflows())
          .thenReturn(List.of(failingWorkflow, successWorkflow));
      doThrow(new RuntimeException("DB error"))
          .when(workflowEndService)
          .forceCompleteWorkflowByTimeout(failingWorkflow);

      // Act
      workflowTimeoutJob.execute(jobExecutionContext);

      // Assert
      verify(workflowEndService).forceCompleteWorkflowByTimeout(failingWorkflow);
      verify(workflowEndService).forceCompleteWorkflowByTimeout(successWorkflow);
    }
  }

  private static Workflow buildRunWorkflow(String tenantId) {
    Tenant tenant = new Tenant();
    tenant.setId(tenantId);

    Exercise simulation = new Exercise();
    simulation.setTenant(tenant);

    Workflow workflow = new Workflow();
    workflow.setId(java.util.UUID.randomUUID().toString());
    workflow.setStatus(WorkflowStatus.RUN);
    workflow.setTimeoutEnabled(true);
    workflow.setTimeoutSeconds(60L);
    workflow.setSimulation(simulation);
    return workflow;
  }
}
