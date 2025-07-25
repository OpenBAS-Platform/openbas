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
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
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
    inject.setStatus(injectStatus);
    return injectRepository.save(inject);
  }

  public void addStartImplantExecutionTraceByInject(
      String injectId, String agentId, String message, Instant startTime) {
    InjectStatus injectStatus =
        injectStatusRepository.findByInjectId(injectId).orElseThrow(ElementNotFoundException::new);
    Agent agent = agentRepository.findById(agentId).orElseThrow(ElementNotFoundException::new);
    ExecutionTrace trace =
        new ExecutionTrace(
            injectStatus,
            ExecutionTraceStatus.INFO,
            null,
            message,
            ExecutionTraceAction.START,
            agent,
            startTime);
    injectStatus.addTrace(trace);
    injectStatusRepository.save(injectStatus);
  }

  private int getCompleteTrace(Inject inject) {
    return inject.getStatus().map(InjectStatus::getTraces).orElse(Collections.emptyList()).stream()
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
    log.info(
        "[issue/2797] Inputs for inject ID: "
            + inject.getId()
            + "::agents.size="
            + agents.size()
            + "::totalCompleteTrace="
            + totalCompleteTrace);
    return agents.size() == totalCompleteTrace;
  }

  public void updateFinalInjectStatus(InjectStatus injectStatus) {
    log.info("[issue/2797] updateFinalInjectStatus 1: " + injectStatus.getId());
    ExecutionStatus finalStatus =
        computeStatus(
            injectStatus.getTraces().stream()
                .filter(t -> ExecutionTraceAction.COMPLETE.equals(t.getAction()))
                .toList());
    log.info("[issue/2797] updateFinalInjectStatus 2: " + injectStatus.getId());
    injectStatus.setTrackingEndDate(Instant.now());
    injectStatus.setName(finalStatus);
    injectStatus.getInject().setUpdatedAt(Instant.now());
  }

  public ExecutionTrace createExecutionTrace(
      InjectStatus injectStatus,
      InjectExecutionInput input,
      Agent agent,
      ObjectNode structuredOutput) {

    // We start by computing the trace date. It should be qual to the START execution trace +
    // input.duration.
    // If the duration is 0 or if there is no START execution trace, we use the current time.
    Instant traceCreationTime =
        (injectStatus.getTraces().isEmpty() || input.getDuration() == 0)
            ? Instant.now()
            : injectStatus.getTraces().stream()
                .filter(
                    t ->
                        ExecutionTraceAction.START.equals(t.getAction())
                            && t.getAgent().getId().equals(agent.getId()))
                .findFirst()
                .map(startTrace -> startTrace.getTime().plusMillis(input.getDuration()))
                .orElse(Instant.now());

    ExecutionTraceAction executionAction = convertExecutionAction(input.getAction());
    ExecutionTraceStatus traceStatus = ExecutionTraceStatus.valueOf(input.getStatus());

    ExecutionTrace base =
        new ExecutionTrace(
            injectStatus,
            traceStatus,
            null,
            input.getMessage(),
            executionAction,
            agent,
            traceCreationTime);
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

  // [issue/2797] region start: Added an alternative locking mechanism
  // Lock map to ensure synchronization on the same inject ID
  private final ConcurrentHashMap<String, Object> locks = new ConcurrentHashMap<>();
  private final ConcurrentHashMap<String, Long> lastAccessTime = new ConcurrentHashMap<>();
  // Maximum age for locks in milliseconds (2 minute)
  private static final long MAX_LOCK_AGE_MS = 120000;

  @Scheduled(fixedDelay = 60000) // Run every 1 minutes
  public void cleanupOldLocks() {
    log.info("[issue/2797] Clean up of old locks started");
    long currentTime = System.currentTimeMillis();
    int removedCount = 0;

    for (Map.Entry<String, Long> entry : lastAccessTime.entrySet()) {
      String injectId = entry.getKey();
      Long lastAccess = entry.getValue();

      if (currentTime - lastAccess > MAX_LOCK_AGE_MS) {
        locks.remove(injectId);
        lastAccessTime.remove(injectId);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      log.info("[issue/2797] Cleaned up {} old locks", removedCount);
    }
  }

  // [issue/2797] region end: Added an alternative locking mechanism

  public void updateInjectStatus(
      Agent agent, Inject inject, InjectExecutionInput input, ObjectNode structuredOutput) {
    InjectStatus injectStatus = inject.getStatus().orElseThrow(ElementNotFoundException::new);

    ExecutionTrace executionTrace =
        createExecutionTrace(injectStatus, input, agent, structuredOutput);
    computeExecutionTraceStatusIfNeeded(injectStatus, executionTrace, agent);
    injectStatus.addTrace(executionTrace);

    // Get or create a lock object for this inject ID
    Object lock = locks.computeIfAbsent(inject.getId(), k -> new Object());
    // Update last access time
    lastAccessTime.put(inject.getId(), System.currentTimeMillis());

    log.info("[issue/2797] Waiting for lock for inject ID: " + inject.getId());
    synchronized (lock) {
      boolean isAllInjectAgentsExecuted = isAllInjectAgentsExecuted(inject);
      log.info("[issue/2797] Acquired lock for inject ID: " + inject.getId());
      log.info(
          "[issue/2797] Inputs for inject ID: "
              + inject.getId()
              + "::action="
              + executionTrace.getAction()
              + "::isAllInjectAgentsExecuted="
              + isAllInjectAgentsExecuted);
      if (executionTrace.getAction().equals(ExecutionTraceAction.COMPLETE)
          && (agent == null || isAllInjectAgentsExecuted)) {
        updateFinalInjectStatus(injectStatus);
      }

      injectRepository.save(inject);
      log.info("Successfully updated inject: " + inject.getId());
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

  public InjectStatus fromExecution(Execution execution, InjectStatus injectStatus) {
    log.info("[issue/2797] fromExecution 1: " + injectStatus.getId());
    if (!execution.getTraces().isEmpty()) {
      List<ExecutionTrace> traces =
          execution.getTraces().stream().peek(t -> t.setInjectStatus(injectStatus)).toList();
      injectStatus.getTraces().addAll(traces);
    }
    log.info("[issue/2797] fromExecution 2:  " + injectStatus.getId());
    if (execution.isAsync() && ExecutionStatus.EXECUTING.equals(injectStatus.getName())) {
      log.info("[issue/2797] fromExecution 3a: " + injectStatus.getId());
      injectStatus.setName(ExecutionStatus.PENDING);
    } else {
      log.info("[issue/2797] fromExecution 3b: " + injectStatus.getId());
      updateFinalInjectStatus(injectStatus);
    }
    log.info("[issue/2797] fromExecution 4: " + injectStatus.getId());
    return injectStatus;
  }

  private InjectStatus getOrInitializeInjectStatus(Inject inject) {
    return inject
        .getStatus()
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
