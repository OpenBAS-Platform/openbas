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
import java.util.Collections;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
@Slf4j
public class InjectStatusService {

  private final InjectRepository injectRepository;
  private final AgentRepository agentRepository;
  private final InjectService injectService;
  private final InjectUtils injectUtils;
  private final InjectStatusRepository injectStatusRepository;

  public List<InjectExecution> findPendingInjectStatusByType(String injectType) {
    return this.injectStatusRepository.pendingForInjectType(injectType);
  }

  @Transactional(rollbackOn = Exception.class)
  public Inject updateInjectStatus(String injectId, InjectUpdateStatusInput input) {
    Inject inject = injectRepository.findById(injectId).orElseThrow();
    // build status
    InjectExecution injectExecution = new InjectExecution();
    injectExecution.setInject(inject);
    injectExecution.setName(ExecutionStatus.valueOf(input.getStatus()));
    // Save status for inject
    inject.setExecutions(injectExecution);
    return injectRepository.save(inject);
  }

  public void addStartImplantExecutionTraceByInject(
      String injectId, String agentId, String message) {
    InjectExecution injectExecution =
        injectStatusRepository.findByInjectId(injectId).orElseThrow(ElementNotFoundException::new);
    Agent agent = agentRepository.findById(agentId).orElseThrow(ElementNotFoundException::new);
    ExecutionTrace trace =
        new ExecutionTrace(
            injectExecution,
            ExecutionTraceStatus.INFO,
            null,
            message,
            ExecutionTraceAction.START,
            agent,
            null);
    injectExecution.addTrace(trace);
    injectStatusRepository.save(injectExecution);
  }

  private int getCompleteTrace(Inject inject) {
    return inject.getExecutions().map(InjectExecution::getTraces).orElse(Collections.emptyList()).stream()
        .filter(trace -> ExecutionTraceAction.COMPLETE.equals(trace.getAction()))
        .filter(trace -> trace.getAgent() != null)
        .map(trace -> trace.getAgent().getId())
        .distinct()
        .toList()
        .size();
  }

  public boolean isAllInjectAgentsExecuted(Inject inject) {
    int totalCompleteTrace = getCompleteTrace(inject);
    List<Agent> agents = this.injectService.getAgentsByInject(inject);
    return agents.size() == totalCompleteTrace;
  }

  public void updateFinalInjectStatus(InjectExecution injectExecution) {
    log.info("[issue/2797] updateFinalInjectStatus 1: " + injectExecution.getId());
    ExecutionStatus finalStatus =
        computeStatus(
            injectExecution.getTraces().stream()
                .filter(t -> ExecutionTraceAction.COMPLETE.equals(t.getAction()))
                .toList());
    log.info("[issue/2797] updateFinalInjectStatus 2: " + injectExecution.getId());
    injectExecution.setTrackingEndDate(Instant.now());
    injectExecution.setName(finalStatus);
    injectExecution.getInject().setUpdatedAt(Instant.now());
  }

  public ExecutionTrace createExecutionTrace(
      InjectExecution injectExecution,
      InjectExecutionInput input,
      Agent agent,
      ObjectNode structuredOutput) {
    ExecutionTraceAction executionAction = convertExecutionAction(input.getAction());
    ExecutionTraceStatus traceStatus = ExecutionTraceStatus.valueOf(input.getStatus());
    ExecutionTrace base =
        new ExecutionTrace(
            injectExecution, traceStatus, null, input.getMessage(), executionAction, agent, null);
    return ExecutionTrace.from(base, structuredOutput);
  }

  private void computeExecutionTraceStatusIfNeeded(
      InjectExecution injectExecution, ExecutionTrace executionTrace, Agent agent) {
    if (agent != null && executionTrace.getAction().equals(ExecutionTraceAction.COMPLETE)) {
      ExecutionTraceStatus traceStatus =
          convertExecutionStatus(
              computeStatus(
                  injectExecution.getTraces().stream()
                      .filter(t -> t.getAgent() != null)
                      .filter(t -> t.getAgent().getId().equals(agent.getId()))
                      .toList()));
      executionTrace.setStatus(traceStatus);
    }
  }

  public void updateInjectStatus(
      Agent agent, Inject inject, InjectExecutionInput input, ObjectNode structuredOutput) {
    InjectExecution injectExecution = inject.getExecutions().orElseThrow(ElementNotFoundException::new);

    ExecutionTrace executionTrace =
        createExecutionTrace(injectExecution, input, agent, structuredOutput);
    computeExecutionTraceStatusIfNeeded(injectExecution, executionTrace, agent);
    injectExecution.addTrace(executionTrace);

    synchronized (inject.getId()) {
      if (executionTrace.getAction().equals(ExecutionTraceAction.COMPLETE)
          && (agent == null || isAllInjectAgentsExecuted(inject))) {
        updateFinalInjectStatus(injectExecution);
      }

      injectRepository.save(inject);
    }
  }

  public ExecutionStatus computeStatus(List<ExecutionTrace> traces) {
    ExecutionStatus executionStatus;
    int successCount = 0, errorCount = 0, partialCount = 0, maybePreventedCount = 0;

    for (ExecutionTrace trace : traces) {
      switch (trace.getStatus()) {
        case SUCCESS, WARNING, ASSET_AGENTLESS -> successCount++;
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

  public InjectExecution fromExecution(Execution execution, InjectExecution injectExecution) {
    log.info("[issue/2797] fromExecution 1: " + injectExecution.getId());
    if (!execution.getTraces().isEmpty()) {
      List<ExecutionTrace> traces =
          execution.getTraces().stream().peek(t -> t.setInjectExecution(injectExecution)).toList();
      injectExecution.getTraces().addAll(traces);
    }
    log.info("[issue/2797] fromExecution 2:  " + injectExecution.getId());
    if (execution.isAsync() && ExecutionStatus.EXECUTING.equals(injectExecution.getName())) {
      log.info("[issue/2797] fromExecution 3a: " + injectExecution.getId());
      injectExecution.setName(ExecutionStatus.PENDING);
    } else {
      log.info("[issue/2797] fromExecution 3b: " + injectExecution.getId());
      updateFinalInjectStatus(injectExecution);
    }
    log.info("[issue/2797] fromExecution 4: " + injectExecution.getId());
    return injectExecution;
  }

  private InjectExecution getOrInitializeInjectStatus(Inject inject) {
    return inject
        .getExecutions()
        .orElseGet(
            () -> {
              InjectExecution newStatus = new InjectExecution();
              newStatus.setInject(inject);
              newStatus.setTrackingSentDate(Instant.now());
              return newStatus;
            });
  }

  public InjectExecution failInjectStatus(@NotNull String injectId, @Nullable String message) {
    Inject inject = this.injectRepository.findById(injectId).orElseThrow();
    InjectExecution injectExecution = getOrInitializeInjectStatus(inject);
    if (message != null) {
      injectExecution.addErrorTrace(message, ExecutionTraceAction.COMPLETE);
    }
    injectExecution.setName(ExecutionStatus.ERROR);
    injectExecution.setTrackingEndDate(Instant.now());
    injectExecution.setPayloadOutput(injectUtils.getStatusPayloadFromInject(inject));
    return injectStatusRepository.save(injectExecution);
  }

  @Transactional
  public InjectExecution initializeInjectStatus(
      @NotNull String injectId, @NotNull ExecutionStatus status) {
    Inject inject = this.injectRepository.findById(injectId).orElseThrow();
    InjectExecution injectExecution = getOrInitializeInjectStatus(inject);
    injectExecution.setName(status);
    injectExecution.setTrackingSentDate(Instant.now());
    injectExecution.setPayloadOutput(injectUtils.getStatusPayloadFromInject(inject));
    return injectStatusRepository.save(injectExecution);
  }

  public Iterable<InjectExecution> saveAll(@NotNull List<InjectExecution> injectExecutions) {
    return this.injectStatusRepository.saveAll(injectExecutions);
  }
}
