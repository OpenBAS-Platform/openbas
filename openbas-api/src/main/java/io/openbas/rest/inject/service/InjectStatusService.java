package io.openbas.rest.inject.service;

import static io.openbas.utils.InjectExecutionUtils.convertExecutionAction;
import static io.openbas.utils.InjectExecutionUtils.convertExecutionStatus;

import io.openbas.database.model.*;
import io.openbas.database.repository.AgentRepository;
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
import java.util.function.Function;
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

  public ExecutionTrace createExecutionTrace(
      InjectStatus injectStatus, InjectExecutionInput input, Agent agent) {
    ExecutionTraceAction executionAction = convertExecutionAction(input.getAction());
    ExecutionTraceStatus traceStatus = ExecutionTraceStatus.valueOf(input.getStatus());
    return new ExecutionTrace(
        injectStatus, traceStatus, null, input.getMessage(), executionAction, agent, null);
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

  public Inject updateInjectStatus(Agent agent, Inject inject, InjectExecutionInput input) {
    InjectStatus injectStatus = inject.getStatus().orElseThrow(ElementNotFoundException::new);

    ExecutionTrace executionTrace = createExecutionTrace(injectStatus, input, agent);
    computeExecutionTraceStatusIfNeeded(injectStatus, executionTrace, agent);
    injectStatus.addTrace(executionTrace);

    if (executionTrace.getAction().equals(ExecutionTraceAction.COMPLETE)
        && (agent == null || isAllInjectAgentsExecuted(inject))) {
      updateFinalInjectStatus(injectStatus);
    }
    return inject;
  }

  public void handleInjectExecutionCallbackList(
      List<InjectExecutionCallback> injectExecutionCallbacks) {

    // Sorting the objects we need to take care of by date
    List<InjectExecutionCallback> sortedInjectExecutionCallbacks =
        injectExecutionCallbacks.stream()
            .sorted(Comparator.comparing(InjectExecutionCallback::getEmissionDate))
            .toList();

    // Getting all the injects we need
    Map<String, Inject> injects =
        injectRepository
            .findAllById(
                sortedInjectExecutionCallbacks.stream()
                    .map(InjectExecutionCallback::getInjectId)
                    .filter(Objects::nonNull)
                    .toList())
            .stream()
            .collect(Collectors.toMap(Inject::getId, Function.identity()));

    // Getting all the agents we need
    Map<String, Agent> agents =
        StreamSupport.stream(
                agentRepository
                    .findAllById(
                        sortedInjectExecutionCallbacks.stream()
                            .map(InjectExecutionCallback::getAgentId)
                            .filter(Objects::nonNull)
                            .toList())
                    .spliterator(),
                false)
            .collect(Collectors.toMap(Agent::getId, Function.identity()));

    // Preparing a list of injects we need to save
    List<Inject> injectsToSave = new ArrayList<>();

    // For each of the trace
    for (InjectExecutionCallback injectExecutionCallback : sortedInjectExecutionCallbacks) {
      try {
        // Getting the inject or throwing an exception
        Inject inject = injects.get(injectExecutionCallback.getInjectId());
        if (inject == null) {
          log.log(Level.SEVERE, "Inject not found: {}", injectExecutionCallback.getInjectId());
          throw new ElementNotFoundException(
              String.format("Inject not found: %s", injectExecutionCallback.getInjectId()));
        }

        // Getting the agent or throwing an exception
        Agent agent = agents.get(injectExecutionCallback.getAgentId());
        if (agent == null) {
          log.log(Level.SEVERE, "Agent not found: {}", injectExecutionCallback.getAgentId());
          throw new ElementNotFoundException(
              String.format("Agent not found: %s", injectExecutionCallback.getAgentId()));
        }

        // -- UPDATE STATUS --
        injectsToSave.add(
            updateInjectStatus(agent, inject, injectExecutionCallback.getInjectExecutionInput()));

      } catch (ElementNotFoundException e) {
        // If we have the inject, we add an error message in it
        log.log(Level.SEVERE, e.getMessage());
        Inject inject = injects.get(injectExecutionCallback.getInjectId());
        if (inject != null) {
          inject
              .getStatus()
              .ifPresent(
                  status -> {
                    ExecutionTrace trace =
                        new ExecutionTrace(
                            status,
                            ExecutionTraceStatus.ERROR,
                            null,
                            e.getMessage(),
                            ExecutionTraceAction.COMPLETE,
                            null,
                            Instant.now());
                    status.addTrace(trace);
                  });

          injectsToSave.add(inject);
        }
      }
    }

    // Saving everything by batch
    injectRepository.saveAll(injectsToSave.stream().distinct().toList());

    // We're doing another pass to take care of the findings
    // This might not be optimal but is a bit simpler to handle.
    // If there are still performance issue, this might be useful to merge these two loops into
    // one.
    for (InjectExecutionCallback injectExecutionCallback : sortedInjectExecutionCallbacks) {

      // Getting the inject or throwing an exception
      Inject inject = injects.get(injectExecutionCallback.getInjectId());
      if (inject == null) {
        log.log(Level.SEVERE, "Inject not found: {}", injectExecutionCallback.getInjectId());
        break;
      }

      // Getting the agent or throwing an exception
      Agent agent = agents.get(injectExecutionCallback.getAgentId());
      if (agent == null) {
        log.log(Level.SEVERE, "Agent not found: {}", injectExecutionCallback.getAgentId());
        break;
      }

      // -- FINDINGS --
      findingService.computeFindings(
          injectExecutionCallback.getInjectExecutionInput(), inject, agent);
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

  public Iterable<InjectStatus> saveAll(@NotNull List<InjectStatus> injectStatuses) {
    return this.injectStatusRepository.saveAll(injectStatuses);
  }
}
