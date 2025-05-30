package io.openbas.rest.inject.service;

import static io.openbas.utils.InjectExecutionUtils.convertExecutionAction;
import static io.openbas.utils.InjectExecutionUtils.convertExecutionStatus;

import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.database.model.*;
import io.openbas.database.repository.AgentRepository;
import io.openbas.database.repository.InjectRepository;
import io.openbas.database.repository.InjectStatusRepository;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.inject.form.InjectExecutionInput;
import io.openbas.rest.inject.form.InjectUpdateStatusInput;
import io.openbas.utils.InjectUtils;
import jakarta.annotation.Nullable;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
@Log
public class InjectStatusService {

  private final InjectRepository injectRepository;
  private final AgentRepository agentRepository;
  private final InjectService injectService;
  private final InjectUtils injectUtils;
  private final InjectStatusRepository injectStatusRepository;

  public List<InjectStatus> findPendingInjectStatusByType(String injectType) {
    return this.injectStatusRepository.pendingForInjectType(injectType);
  }

  @Transactional(rollbackOn = Exception.class)
  public Inject updateInjectStatus(String injectId, InjectUpdateStatusInput input) {
    Inject inject = injectRepository.findById(injectId).orElseThrow();
    // build status
    InjectStatus injectStatus = new InjectStatus();
    injectStatus.setInject(inject);
    injectStatus.setName(ExecutionStatus.valueOf(input.getStatus()));
    // Save status for inject
    inject.setExecutions(new ArrayList<>(Arrays.asList(injectStatus))); // TODO POC
    return injectRepository.save(inject);
  }

  public void addStartImplantExecutionTraceByInject(
      String executionId, String agentId, String message) {
    InjectStatus injectStatus =
        injectStatusRepository
            .findById(executionId)
            .orElseThrow(ElementNotFoundException::new);
    Agent agent = agentRepository.findById(agentId).orElseThrow(ElementNotFoundException::new);
    ExecutionTrace trace =
        new ExecutionTrace(
            injectStatus,
            ExecutionTraceStatus.INFO,
            null,
            message,
            ExecutionTraceAction.START,
            agent,
            null);
    injectStatus.addTrace(trace);
    injectStatusRepository.save(injectStatus); // TODO POC
  }

  private int getCompleteTrace(InjectStatus execution) {
    return execution
        .getTraces() // TODO POC
        .stream()
        .filter(trace -> ExecutionTraceAction.COMPLETE.equals(trace.getAction()))
        .filter(trace -> trace.getAgent() != null)
        .map(trace -> trace.getAgent().getId())
        .distinct()
        .toList()
        .size();
  }

  public boolean isAllAgentsExecuted(InjectStatus execution) {
    int totalCompleteTrace = getCompleteTrace(execution);
    List<Agent> agents = this.injectService.getAgentsByInject(execution.getInject());
    return agents.size() == totalCompleteTrace;
  }

  public void updateFinalExecutionStatus(InjectStatus execution) {
    ExecutionStatus finalStatus =
        computeStatus(
            execution.getTraces().stream()
                .filter(t -> ExecutionTraceAction.COMPLETE.equals(t.getAction()))
                .toList());

    execution.setTrackingEndDate(Instant.now());
    execution.setName(finalStatus);
    execution.getInject().setUpdatedAt(Instant.now());
    execution.getInject().setStatus(finalStatus); // TODO POC FINAL STATUS INJECT GLOBAL
    execution.getInject().setFirstExecutionDate(Instant.now()); // TODO POC
  }

  public ExecutionTrace createExecutionTrace(
      InjectStatus injectStatus,
      InjectExecutionInput input,
      Agent agent,
      ObjectNode structuredOutput) {
    ExecutionTraceAction executionAction = convertExecutionAction(input.getAction());
    ExecutionTraceStatus traceStatus = ExecutionTraceStatus.valueOf(input.getStatus());
    ExecutionTrace base =
        new ExecutionTrace(
            injectStatus, traceStatus, null, input.getMessage(), executionAction, agent, null);
    return ExecutionTrace.from(base, structuredOutput);
  }

  private void computeExecutionTraceStatusIfNeeded(
      InjectStatus injectStatus, ExecutionTrace executionTrace, Agent agent) {
    if (agent != null && executionTrace.getAction().equals(ExecutionTraceAction.COMPLETE)) {
      ExecutionTraceStatus traceStatus =
          convertExecutionStatus(
              computeStatus(
                  injectStatus.getTraces().stream()
                      .filter(t -> t.getAgent() != null)
                      .filter(t -> t.getAgent().getId().equals(agent.getId()))
                      .toList()));
      executionTrace.setStatus(traceStatus);
    }
  }

  public void updateExecutionStatus(
      Agent agent,
      InjectStatus execution,
      InjectExecutionInput input,
      ObjectNode structuredOutput) {

    ExecutionTrace executionTrace = createExecutionTrace(execution, input, agent, structuredOutput);
    computeExecutionTraceStatusIfNeeded(execution, executionTrace, agent);
    execution.addTrace(executionTrace);

    synchronized (execution.getId()) {
      if (executionTrace.getAction().equals(ExecutionTraceAction.COMPLETE)
          && (agent == null || isAllAgentsExecuted(execution))) {
        updateFinalExecutionStatus(execution);
      }

      // TODO Compute Status for Inject global
      injectStatusRepository.save(execution);
      injectRepository.save(execution.getInject());
    }
  }

  public ExecutionStatus computeStatus(List<ExecutionTrace> traces) {
    ExecutionStatus executionStatus;
    int successCount = 0, errorCount = 0, partialCount = 0, maybePreventedCount = 0;

    for (ExecutionTrace trace : traces) {
      switch (trace.getStatus()) {
        case SUCCESS, WARNING -> successCount++;
        case PARTIAL -> partialCount++;
        case ERROR, COMMAND_NOT_FOUND, AGENT_INACTIVE -> errorCount++;
        case MAYBE_PREVENTED, MAYBE_PARTIAL_PREVENTED, COMMAND_CANNOT_BE_EXECUTED ->
            maybePreventedCount++;
      }
    }

    if (successCount > 0 && errorCount == 0 && maybePreventedCount == 0 && partialCount == 0) {
      executionStatus = ExecutionStatus.SUCCESS;
    } else if (errorCount > 0
        && successCount == 0
        && maybePreventedCount == 0
        && partialCount == 0) {
      executionStatus = ExecutionStatus.ERROR;
    } else if (maybePreventedCount > 0
        && successCount == 0
        && errorCount == 0
        && partialCount == 0) {
      executionStatus = ExecutionStatus.MAYBE_PREVENTED;
    } else if (partialCount > 0 && errorCount == 0 && maybePreventedCount == 0
        || successCount > 0) {
      executionStatus = ExecutionStatus.PARTIAL;
    } else {
      executionStatus = ExecutionStatus.MAYBE_PARTIAL_PREVENTED;
    }
    return executionStatus;
  }

  public InjectStatus fromExecution(Execution execution, InjectStatus injectStatus) {
    if (!execution.getTraces().isEmpty()) {
      List<ExecutionTrace> traces =
          execution.getTraces().stream().peek(t -> t.setInjectStatus(injectStatus)).toList();
      injectStatus.getTraces().addAll(traces);
    }

    if (execution.isAsync() && ExecutionStatus.EXECUTING.equals(injectStatus.getName())) {
      injectStatus.setName(ExecutionStatus.PENDING);
    } else {
      updateFinalExecutionStatus(injectStatus);
    }

    return injectStatus;
  }

  public InjectStatus getOrInitializeInjectStatus(Inject inject) {
    return inject
        .getExecution() // TODO POC
        .orElseGet(
            () -> {
              InjectStatus newStatus = new InjectStatus();
              newStatus.setInject(inject);
              newStatus.setTrackingSentDate(Instant.now());
              return newStatus;
            });
  }

  public InjectStatus failInjectStatus(@NotNull String injectId, @Nullable String message) {
    Inject inject = this.injectRepository.findById(injectId).orElseThrow();
    InjectStatus injectStatus = getOrInitializeInjectStatus(inject);
    if (message != null) {
      injectStatus.addErrorTrace(message, ExecutionTraceAction.COMPLETE);
    }
    injectStatus.setName(ExecutionStatus.ERROR);
    injectStatus.setTrackingEndDate(Instant.now());
    injectStatus.setPayloadOutput(injectUtils.getStatusPayloadFromInject(inject));
    return injectStatusRepository.save(injectStatus);
  }

  @Transactional
  public InjectStatus initializeInjectStatus(
      @NotNull String injectId, @NotNull ExecutionStatus status) {
    Inject inject = this.injectRepository.findById(injectId).orElseThrow();
    InjectStatus injectStatus = getOrInitializeInjectStatus(inject);
    injectStatus.setName(status);
    injectStatus.setTrackingSentDate(Instant.now());
    injectStatus.setPayloadOutput(injectUtils.getStatusPayloadFromInject(inject));
    return injectStatusRepository.save(injectStatus);
  }

  public Iterable<InjectStatus> saveAll(@NotNull List<InjectStatus> injectStatuses) {
    return this.injectStatusRepository.saveAll(injectStatuses);
  }
}
