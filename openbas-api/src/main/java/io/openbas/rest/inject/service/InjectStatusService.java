package io.openbas.rest.inject.service;

import static io.openbas.utils.InjectExecutionUtils.convertExecutionAction;
import static io.openbas.utils.InjectExecutionUtils.convertExecutionStatus;

import io.openbas.database.model.*;
import io.openbas.database.repository.AgentRepository;
import io.openbas.database.repository.FindingRepository;
import io.openbas.database.repository.InjectRepository;
import io.openbas.database.repository.InjectStatusRepository;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.finding.FindingService;
import io.openbas.rest.inject.form.InjectExecutionCallback;
import io.openbas.rest.inject.form.InjectExecutionInput;
import io.openbas.rest.inject.form.InjectUpdateStatusInput;
import io.openbas.utils.InjectUtils;
import jakarta.annotation.Nullable;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.*;
import java.util.logging.Level;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

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
  private final FindingService findingService;
  private final FindingRepository findingRepository;

  ScheduledFuture<?> scheduledTask = null;
  final BlockingQueue<InjectExecutionCallback> callbacksWaiting = new LinkedBlockingQueue<>();

  private final ScheduledExecutorService executorService = Executors.newScheduledThreadPool(20);

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
      String injectId, String agentId, String message) {
    InjectStatus injectStatus =
        injectStatusRepository.findByInjectId(injectId).orElseThrow(ElementNotFoundException::new);
    Agent agent = agentRepository.findById(agentId).orElseThrow(ElementNotFoundException::new);
    ExecutionTraces trace =
        new ExecutionTraces(
            injectStatus,
            ExecutionTraceStatus.INFO,
            null,
            message,
            ExecutionTraceAction.START,
            agent,
            null);
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
    return agents.size() == totalCompleteTrace;
  }

  public void updateFinalInjectStatus(InjectStatus injectStatus) {
    ExecutionStatus finalStatus =
        computeStatus(
            injectStatus.getTraces().stream()
                .filter(t -> ExecutionTraceAction.COMPLETE.equals(t.getAction()))
                .toList());

    injectStatus.setTrackingEndDate(Instant.now());
    injectStatus.setName(finalStatus);
    injectStatus.getInject().setUpdatedAt(Instant.now());
  }

  public ExecutionTraces createExecutionTrace(
      InjectStatus injectStatus, InjectExecutionInput input, Agent agent) {
    ExecutionTraceAction executionAction = convertExecutionAction(input.getAction());
    ExecutionTraceStatus traceStatus = ExecutionTraceStatus.valueOf(input.getStatus());
    return new ExecutionTraces(
        injectStatus, traceStatus, null, input.getMessage(), executionAction, agent, null);
  }

  private void computeExecutionTraceStatusIfNeeded(
      InjectStatus injectStatus, ExecutionTraces executionTraces, Agent agent) {
    if (agent != null && executionTraces.getAction().equals(ExecutionTraceAction.COMPLETE)) {
      ExecutionTraceStatus traceStatus =
          convertExecutionStatus(
              computeStatus(
                  injectStatus.getTraces().stream()
                      .filter(t -> t.getAgent() != null)
                      .filter(t -> t.getAgent().getId().equals(agent.getId()))
                      .toList()));
      executionTraces.setStatus(traceStatus);
    }
  }

  private void updateInjectStatus(Agent agent, Inject inject, InjectExecutionInput input) {
    InjectStatus injectStatus = inject.getStatus().orElseThrow(ElementNotFoundException::new);

    ExecutionTraces executionTraces = createExecutionTrace(injectStatus, input, agent);
    computeExecutionTraceStatusIfNeeded(injectStatus, executionTraces, agent);
    injectStatus.addTrace(executionTraces);

    if (executionTraces.getAction().equals(ExecutionTraceAction.COMPLETE)
        && (agent == null || isAllInjectAgentsExecuted(inject))) {
      updateFinalInjectStatus(injectStatus);
    }
  }

  public void handleInjectExecutionCallback(List<InjectExecutionCallback> inputs) {
    Map<String, Inject> injectMap = injectRepository
            .findAllById(inputs.stream().map(InjectExecutionCallback::getInjectId).toList())
            .stream()
            .collect(Collectors.toMap(Inject::getId, inject -> inject));

    Map<String, Agent> agentMap = StreamSupport.stream(agentRepository
            .findAllById(inputs.stream().map(InjectExecutionCallback::getAgentId).toList())
            .spliterator(), false)
            .collect(Collectors.toMap(Agent::getId, agent -> agent));

    Set<Inject> injectsList = new HashSet<>();
    List<Finding> findingsList = new ArrayList<>();

    for (InjectExecutionCallback injectExecutionCallback : inputs) {
      Inject inject = null;

      try {
        inject = injectMap.get(injectExecutionCallback.getInjectId());

        Agent agent = agentMap.get(injectExecutionCallback.getAgentId());

        // -- UPDATE STATUS --
        updateInjectStatus(agent, inject, injectExecutionCallback.getInjectExecutionInput());

        // -- FINDINGS --
        findingsList.addAll(findingService.computeFindings(injectExecutionCallback.getInjectExecutionInput(), inject, agent));

      } catch (Exception e) {
        log.log(Level.SEVERE, e.getMessage());
        if (inject != null) {
          inject
                  .getStatus()
                  .ifPresent(
                          status -> {
                            ExecutionTraces trace =
                                    new ExecutionTraces(
                                            status,
                                            ExecutionTraceStatus.ERROR,
                                            null,
                                            e.getMessage(),
                                            ExecutionTraceAction.COMPLETE,
                                            null,
                                            Instant.now());
                            status.addTrace(trace);
                          });
        }
      } finally {
        if(inject != null) {
          injectsList.add(inject);
        }
      }
    }
    injectRepository.saveAll(injectsList);
    findingRepository.saveAll(findingsList);
  }

  public void batchInjectExecutionCallback(InjectExecutionCallback input) {
    callbacksWaiting.add(input);
    if(callbacksWaiting.size() > 1000) {
      scheduledTask = null;
      executorService.submit(() -> {
        scheduledTask.cancel(true);
        batchInsert();
      });
    } else {
      if(scheduledTask == null) {
        scheduledTask = executorService.schedule(this::batchInsert, 10, TimeUnit.SECONDS);
      }
    }
  }

  private void batchInsert() {
    try {
      List<InjectExecutionCallback> callbacks = new ArrayList<>();
      callbacksWaiting.drainTo(callbacks);
      handleInjectExecutionCallback(callbacks);
    } catch (RuntimeException e) {
      log.severe(e.getMessage());
    }
  }

  public ExecutionStatus computeStatus(List<ExecutionTraces> traces) {
    ExecutionStatus executionStatus;
    int successCount = 0, errorCount = 0, partialCount = 0, maybePreventedCount = 0;

    for (ExecutionTraces trace : traces) {
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
      List<ExecutionTraces> traces =
          execution.getTraces().stream().peek(t -> t.setInjectStatus(injectStatus)).toList();
      injectStatus.getTraces().addAll(traces);
    }

    if (execution.isAsync()) {
      injectStatus.setName(ExecutionStatus.PENDING);
    } else {
      updateFinalInjectStatus(injectStatus);
    }

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
}
