package io.openaev.scheduler.jobs;

import static io.openaev.database.model.Tenant.DEFAULT_TENANT_UUID;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import io.openaev.IntegrationTest;
import io.openaev.context.TenantContext;
import io.openaev.database.model.Step;
import io.openaev.database.model.StepDelayQueue;
import io.openaev.database.model.StepStatus;
import io.openaev.database.model.Workflow;
import io.openaev.database.model.WorkflowStatus;
import io.openaev.database.repository.WorkflowRepository;
import io.openaev.rest.exception.ChainingException;
import io.openaev.service.chaining.StepDelayQueueService;
import io.openaev.service.chaining.StepService;
import io.openaev.service.chaining.WorkflowService;
import io.openaev.utils.TenantIsolationTestHelper;
import io.openaev.utils.fixtures.ExerciseFixture;
import io.openaev.utils.fixtures.StepFixture;
import io.openaev.utils.fixtures.WorkflowFixture;
import io.openaev.utils.fixtures.composers.ExerciseComposer;
import io.openaev.utils.fixtures.composers.WorkflowComposer;
import io.openaev.utils.mockUser.WithMockUser;
import jakarta.persistence.EntityManager;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;

@DisplayName("QueueChainingJob scopes each delayed step to its owning tenant")
@WithMockUser
class QueueChainingJobBackgroundIsolationTest extends IntegrationTest {

  @Autowired private QueueChainingJob queueChainingJob;
  @Autowired private TenantIsolationTestHelper tenantHelper;
  @Autowired private WorkflowComposer workflowComposer;
  @Autowired private ExerciseComposer exerciseComposer;
  @Autowired private WorkflowRepository workflowRepository;
  @Autowired private EntityManager entityManager;

  @MockBean private StepDelayQueueService stepDelayQueueService;
  @MockBean private StepService stepService;
  @MockBean private WorkflowService workflowService;

  private final List<ScopeObservation> popScopes = new ArrayList<>();
  private final List<ScopeObservation> createScopes = new ArrayList<>();
  private final List<ScopeObservation> enqueueScopes = new ArrayList<>();

  private final List<String> committedTenantIds = new ArrayList<>();

  @BeforeEach
  void setUp() throws ChainingException {
    popScopes.clear();
    createScopes.clear();
    enqueueScopes.clear();

    when(workflowService.isWorkflowEnded(anyString())).thenReturn(false);
    stubProcessing(Set.of());
  }

  @AfterEach
  void cleanup() {
    TenantContext.clearCurrentTenant();
    if (!committedTenantIds.isEmpty()) {
      tenantHelper.deleteCommittedTenants(committedTenantIds.toArray(String[]::new));
      committedTenantIds.clear();
    }
  }

  @Nested
  @DisplayName("Per-item scoping")
  class PerItemScoping {

    @Test
    @DisplayName("given one delayed step should scope create and enqueue to the workflow tenant")
    void given_oneDelayedStep_should_scopeCreateAndEnqueueToTheWorkflowTenant() throws Exception {
      // Arrange
      String tenantA = createTenant("queue-job-a");
      Workflow workflowA = createWorkflowRunInTenant(tenantA);
      stubPopReturning(List.of(delayedStepFor(workflowA)));

      // Act
      queueChainingJob.execute(null);

      // Assert
      assertThat(popScopes)
          .singleElement()
          .satisfies(scope -> assertThat(scope.gucScope()).contains(tenantA));
      assertThat(createScopes)
          .singleElement()
          .satisfies(
              scope -> {
                assertThat(scope.workflowId()).isEqualTo(workflowA.getId());
                assertThat(scope.threadTenant()).isEqualTo(tenantA);
                assertThat(scope.threadTenant()).isNotEqualTo(DEFAULT_TENANT_UUID);
                assertThat(scope.gucScope()).isEqualTo(tenantA);
              });
      assertThat(enqueueScopes)
          .singleElement()
          .satisfies(
              scope -> {
                assertThat(scope.workflowId()).isEqualTo(workflowA.getId());
                assertThat(scope.threadTenant()).isEqualTo(tenantA);
                assertThat(scope.gucScope()).isEqualTo(tenantA);
              });
    }

    @Test
    @DisplayName("given two tenants in one pop batch should scope each item to its own tenant")
    void given_twoTenantsInOnePopBatch_should_scopeEachItemToItsOwnTenant() throws Exception {
      // Arrange
      String tenantA = createTenant("queue-job-batch-a");
      String tenantB = createTenant("queue-job-batch-b");
      Workflow workflowA = createWorkflowRunInTenant(tenantA);
      Workflow workflowB = createWorkflowRunInTenant(tenantB);
      stubPopReturning(List.of(delayedStepFor(workflowA), delayedStepFor(workflowB)));

      // Act
      queueChainingJob.execute(null);

      // Assert
      assertThat(popScopes)
          .singleElement()
          .satisfies(
              scope -> {
                assertThat(scope.gucScope()).contains(tenantA);
                assertThat(scope.gucScope()).contains(tenantB);
              });
      assertThat(createScopes)
          .extracting(
              ScopeObservation::workflowId,
              ScopeObservation::threadTenant,
              ScopeObservation::gucScope)
          .containsExactly(
              org.assertj.core.groups.Tuple.tuple(workflowA.getId(), tenantA, tenantA),
              org.assertj.core.groups.Tuple.tuple(workflowB.getId(), tenantB, tenantB));
      assertThat(enqueueScopes)
          .extracting(
              ScopeObservation::workflowId,
              ScopeObservation::threadTenant,
              ScopeObservation::gucScope)
          .containsExactly(
              org.assertj.core.groups.Tuple.tuple(workflowA.getId(), tenantA, tenantA),
              org.assertj.core.groups.Tuple.tuple(workflowB.getId(), tenantB, tenantB));
    }
  }

  @Test
  @DisplayName("given one tenant fails should still process the next tenant in its own transaction")
  void given_oneTenantFails_should_stillProcessTheNextTenantInItsOwnTransaction() throws Exception {
    // Arrange
    String tenantA = createTenant("queue-job-fail-a");
    String tenantB = createTenant("queue-job-fail-b");
    Workflow workflowA = createWorkflowRunInTenant(tenantA);
    Workflow workflowB = createWorkflowRunInTenant(tenantB);
    stubPopReturning(List.of(delayedStepFor(workflowA), delayedStepFor(workflowB)));
    stubProcessing(Set.of(workflowA.getId()));

    // Act
    queueChainingJob.execute(null);

    // Assert
    assertThat(createScopes)
        .extracting(
            ScopeObservation::workflowId,
            ScopeObservation::threadTenant,
            ScopeObservation::gucScope)
        .containsExactly(
            org.assertj.core.groups.Tuple.tuple(workflowA.getId(), tenantA, tenantA),
            org.assertj.core.groups.Tuple.tuple(workflowB.getId(), tenantB, tenantB));
    assertThat(enqueueScopes)
        .extracting(
            ScopeObservation::workflowId,
            ScopeObservation::threadTenant,
            ScopeObservation::gucScope)
        .containsExactly(org.assertj.core.groups.Tuple.tuple(workflowB.getId(), tenantB, tenantB));
    verify(stepService, never())
        .enqueueReadySteps(anyList(), org.mockito.ArgumentMatchers.eq(workflowA));
    verify(stepService, times(1))
        .enqueueReadySteps(anyList(), org.mockito.ArgumentMatchers.eq(workflowB));
  }

  private void stubPopReturning(List<StepDelayQueue> delayedSteps) {
    when(stepDelayQueueService.popNextToProcess())
        .thenAnswer(
            ignored -> {
              popScopes.add(currentScope("pop"));
              return delayedSteps;
            });
  }

  private void stubProcessing(Set<String> failingWorkflowIds) throws ChainingException {
    when(stepService.createReadySteps(any(Step.class), any(Workflow.class), any(), anyInt()))
        .thenAnswer(
            invocation -> {
              Workflow workflowRun = invocation.getArgument(1);
              createScopes.add(currentScope(workflowRun.getId()));
              if (failingWorkflowIds.contains(workflowRun.getId())) {
                throw new ChainingException("boom for workflow " + workflowRun.getId());
              }
              return List.of(StepFixture.getDefaultStepExecution(StepStatus.READY));
            });
    doAnswer(
            invocation -> {
              Workflow workflowRun = invocation.getArgument(1);
              enqueueScopes.add(currentScope(workflowRun.getId()));
              return null;
            })
        .when(stepService)
        .enqueueReadySteps(anyList(), any(Workflow.class));
  }

  private ScopeObservation currentScope(String workflowId) {
    return new ScopeObservation(
        workflowId,
        TenantContext.getCurrentTenant(),
        (String)
            entityManager
                .createNativeQuery("SELECT current_setting('app.current_tenants', true)")
                .getSingleResult());
  }

  private String createTenant(String name) throws Exception {
    String tenantId = tenantHelper.createTenantWithCurrentUser(name).getId();
    committedTenantIds.add(tenantId);
    return tenantId;
  }

  private Workflow createWorkflowRunInTenant(String tenantId) {
    String previousTenant =
        TenantContext.hasCurrentTenant() ? TenantContext.getCurrentTenant() : null;
    TenantContext.setCurrentTenant(tenantId);
    try {
      Workflow workflowRun =
          workflowComposer
              .forWorkflow(WorkflowFixture.getDefaultWorkflowExecution(WorkflowStatus.RUN))
              .withSimulation(exerciseComposer.forExercise(ExerciseFixture.createDefaultExercise()))
              .persist()
              .get();
      assertThat(workflowRepository.findTenantIdByWorkflowId(workflowRun.getId()))
          .contains(tenantId);
      return workflowRun;
    } finally {
      if (previousTenant == null) {
        TenantContext.clearCurrentTenant();
      } else {
        TenantContext.setCurrentTenant(previousTenant);
      }
    }
  }

  private StepDelayQueue delayedStepFor(Workflow workflowRun) {
    return StepDelayQueue.builder()
        .workflowRun(workflowRun)
        .stepTemplate(StepFixture.getDefaultStepTemplate())
        .input("{}")
        .build();
  }

  private record ScopeObservation(String workflowId, String threadTenant, String gucScope) {}
}
