package io.openbas.rest.inject.service;

import io.openbas.database.helper.InjectStatusRepositoryHelper;
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
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.logging.Level;

import static io.openbas.utils.InjectExecutionUtils.convertExecutionAction;
import static io.openbas.utils.InjectExecutionUtils.convertExecutionStatus;

@RequiredArgsConstructor
@Service
@Log
public class BatchingInjectStatusService {

  private final InjectRepository injectRepository;
  private final AgentRepository agentRepository;
  private final InjectService injectService;
  private final InjectUtils injectUtils;
  private final InjectStatusRepository injectStatusRepository;
  private final FindingService findingService;
  private final InjectStatusRepositoryHelper injectStatusRepositoryHelper;
  private final StructuredOutputUtils structuredOutputUtils;

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

  /**
   * Update the final status of the inject
   *
   * @param simpleInjectStatus the inject status corresponding
   * @param statuses the statuses of the execution traces
   */
  public void updateFinalInjectStatus(
      SimpleInjectStatus simpleInjectStatus, List<ExecutionTraceStatus> statuses) {
    // Deducing the final status
    ExecutionStatus finalStatus = computeStatus(statuses);

    // Updating the inject status accordingly
    simpleInjectStatus.setName(finalStatus);
  }

  /**
   * Update the final status of the inject
   *
   * @param injectStatus the inject status corresponding
   */
  public void updateFinalInjectStatus(InjectStatus injectStatus) {
    // Deducing the final status
    ExecutionStatus finalStatus =
        computeStatus(injectStatus.getTraces().stream().map(ExecutionTrace::getStatus).toList());

    // Updating the inject status accordingly
    injectStatus.setTrackingEndDate(Instant.now());
    injectStatus.setName(finalStatus);
    injectStatus.getInject().setUpdatedAt(Instant.now());
  }

  /**
   * Create an execution trace from the inject status, the input and the agent
   *
   * @param injectStatusId the inject status Id
   * @param input the input
   * @param agentId the agent Id
   * @return the newly created ExecutionTrace
   */
  public SimpleExecutionTrace createExecutionTrace(
      String injectStatusId, InjectExecutionInput input, String agentId) {
    ExecutionTraceAction executionAction = convertExecutionAction(input.getAction());
    // Convert the string of the status into an ExecutionTraceStatus
    ExecutionTraceStatus traceStatus = ExecutionTraceStatus.valueOf(input.getStatus());
    // Create the ExecutionTrace per se
    return new SimpleExecutionTrace(
        injectStatusId, traceStatus, null, input.getMessage(), executionAction, agentId, null);
  }

  /**
   * Update the status of the execution trace
   *
   * @param traces the traces already on the inject associated
   * @param executionTrace the execution trace to update
   * @param agentId the agent id
   */
  private void computeExecutionTraceStatusIfNeeded(
      List<SimpleExecutionTrace> traces, SimpleExecutionTrace executionTrace, String agentId) {
    // Figuring out the execution trace status
    ExecutionTraceStatus traceStatus =
        convertExecutionStatus(
            computeStatus(
                traces.stream()
                    .filter(t -> t.getAgentId() != null)
                    .filter(t -> t.getAgentId().equals(agentId))
                    .map(SimpleExecutionTrace::getStatus)
                    .toList()));
    // Updating the status in the execution trace
    executionTrace.setStatus(traceStatus);
  }

  /**
   * Update the inject status, creates the execution trace and adding it to the inject status
   *
   * @param agentId the agent ID
   * @param injectStatus the inject status to update
   * @param input the inputs
   * @return the newly created execution trace
   */
  public SimpleExecutionTrace updateInjectStatus(
      String agentId,
      SimpleInjectStatus injectStatus,
      List<SimpleExecutionTrace> traces,
      InjectExecutionInput input) {
    SimpleExecutionTrace executionTrace =
        createExecutionTrace(injectStatus.getId(), input, agentId);

    // If we do have an agent and that our execution trace means we finished execution
    if (agentId != null && executionTrace.getAction().equals(ExecutionTraceAction.COMPLETE)) {
      computeExecutionTraceStatusIfNeeded(traces, executionTrace, agentId);
    }

    // If the execution trace is complete, we update the final status of the inject
    if (executionTrace.getAction().equals(ExecutionTraceAction.COMPLETE)) {
      updateFinalInjectStatus(
          injectStatus, traces.stream().map(SimpleExecutionTrace::getStatus).toList());
    }
    return executionTrace;
  }

  public Inject updateInjectStatus(Agent agent, Inject inject, InjectExecutionInput input) {
    InjectStatus injectStatus = inject.getStatus().orElseThrow(ElementNotFoundException::new);

    ExecutionTrace executionTrace =
            createExecutionTrace(injectStatus, input, agent, structuredOutput);
    computeExecutionTraceStatusIfNeeded(injectStatus, executionTrace, agent);
    injectStatus.addTrace(executionTrace);

    if (executionTrace.getAction().equals(ExecutionTraceAction.COMPLETE)
            && (agent == null || isAllInjectAgentsExecuted(inject))) {
      updateFinalInjectStatus(injectStatus);
    }
    return inject;
  }

  @Transactional
  public void handleInjectExecutionCallbackList(
      List<InjectExecutionCallback> injectExecutionCallbacks) {

    Instant start = Instant.now();
    // Sorting the objects we need to take care of by date
    List<InjectExecutionCallback> sortedInjectExecutionCallbacks =
        injectExecutionCallbacks.stream()
            .sorted(Comparator.comparing(InjectExecutionCallback::getEmissionDate))
            .toList();

    Map<String, SimpleInjectStatus> simpleInjectStatus =
        injectStatusRepositoryHelper.getSimpleInjectStatusesByInjectId(
            sortedInjectExecutionCallbacks.stream()
                .map(InjectExecutionCallback::getInjectId)
                .filter(Objects::nonNull)
                .toList());

    Map<String, List<SimpleExecutionTrace>> mapSimpleExecutionTraceByInjectStatusId =
        injectStatusRepositoryHelper.getSimpleExecutionTracesByInjectStatusId(
            simpleInjectStatus.values().stream().map(SimpleInjectStatus::getId).toList());

    Instant postFetchInject = Instant.now();

    Instant postFetchAgent = Instant.now();

    // Preparing a list of injects we need to save
    Set<SimpleInjectStatus> injectsStatusToSave = new HashSet<>();
    Set<SimpleExecutionTrace> executionTraceToSave = new HashSet<>();

    // For each of the trace
    for (InjectExecutionCallback injectExecutionCallback : sortedInjectExecutionCallbacks) {
      try {
        // Getting the inject or throwing an exception
        SimpleInjectStatus injectStatus =
            simpleInjectStatus.get(injectExecutionCallback.getInjectId());
        if (injectStatus == null) {
          log.log(Level.SEVERE, "Inject not found: {}", injectExecutionCallback.getInjectId());
          throw new ElementNotFoundException(
              String.format("Inject not found: %s", injectExecutionCallback.getInjectId()));
        }

        // -- UPDATE STATUS --
        executionTraceToSave.add(
            updateInjectStatus(
                injectExecutionCallback.getAgentId(),
                injectStatus,
                mapSimpleExecutionTraceByInjectStatusId.get(injectStatus.getId()),
                injectExecutionCallback.getInjectExecutionInput()));
        injectsStatusToSave.add(injectStatus);

      } catch (ElementNotFoundException e) {
        // If we have the inject, we add an error message in it
        log.log(Level.SEVERE, e.getMessage());
        SimpleInjectStatus injectStatus =
            simpleInjectStatus.get(injectExecutionCallback.getInjectId());
        if (injectStatus != null) {
          SimpleExecutionTrace trace =
              new SimpleExecutionTrace(
                  injectStatus.getId(),
                  ExecutionTraceStatus.ERROR,
                  null,
                  e.getMessage(),
                  ExecutionTraceAction.COMPLETE,
                  null,
                  Instant.now());
          executionTraceToSave.add(trace);
          injectsStatusToSave.add(injectStatus);
        }
      }
    }

    // Saving everything by batch
    injectStatusRepositoryHelper.updateInjectStatusWithTraces(
        injectsStatusToSave.stream().toList(), executionTraceToSave.stream().toList());

    Instant postInsertExecution = Instant.now();

    // We're doing another pass to take care of the findings
    // This might not be optimal but is a bit simpler to handle.
    // If there are still performance issue, this might be useful to merge these two loops into
    // one.
    /*for (InjectExecutionCallback injectExecutionCallback : sortedInjectExecutionCallbacks) {

      // Getting the inject or throwing an exception
      Inject inject = injects.get(injectExecutionCallback.getInjectId());
      if (inject == null) {
        log.log(Level.SEVERE, "Inject not found: {}", injectExecutionCallback.getInjectId());
        continue;
      }

      // Getting the agent or throwing an exception
      Agent agent = agents.get(injectExecutionCallback.getAgentId());
      if (agent == null) {
        log.log(Level.SEVERE, "Agent not found: {}", injectExecutionCallback.getAgentId());
        continue;
      }

      Set<OutputParser> outputParsers = structuredOutputUtils.extractOutputParsers(inject);
      Optional<ObjectNode> structuredOutput =
              structuredOutputUtils.computeStructuredOutput(outputParsers, injectExecutionCallback.getInjectExecutionInput());

      ObjectNode structured = structuredOutput.orElse(null);

      // -- FINDINGS --
      if (structured != null) {
        if (agent != null) {
          // Extract findings from structured outputs generated by the output parsers specified in
          // the
          // payload, typically derived from the raw output of the implant execution.
          findingService.extractFindingsFromOutputParsers(inject, agent, outputParsers, structured);
        } else {
          // Structured output directly provided (e.g., from injectors)
          findingService.extractFindingsFromInjectorContract(inject, structured);
        }
      }
    }*/

    Instant postComputeFindings = Instant.now();

    log.log(
        Level.WARNING,
        String.format("We took care of %s callbacks", injectExecutionCallbacks.size()));
    log.log(Level.WARNING, String.format("We took care of %s traces", executionTraceToSave.size()));
    log.log(
        Level.WARNING,
        String.format(
            "Time took for fetch injects : %s",
            postFetchInject.minusMillis(start.toEpochMilli()).toEpochMilli()));
    log.log(
        Level.WARNING,
        String.format(
            "Time took for fetch agents : %s",
            postFetchAgent.minusMillis(postFetchInject.toEpochMilli()).toEpochMilli()));
    log.log(
        Level.WARNING,
        String.format(
            "Time took for save : %s",
            postInsertExecution.minusMillis(postFetchAgent.toEpochMilli()).toEpochMilli()));
    log.log(
        Level.WARNING,
        String.format(
            "Time took for compute findings : %s",
            postComputeFindings.minusMillis(postInsertExecution.toEpochMilli()).toEpochMilli()));
  }

  /**
   * Compute the status using a list of traces. To do that, we count the number of successes,
   * partial, errors and maybe prevented. If we have only success, we're in success. If we only have
   * errors, we're in error. If we only have maybe prevented, we're in maybe prevented. If we have
   * partials and successes, we're in partial. Otherwise, we're in maybe partial prevented
   *
   * @param statuses the list of statuses to compute
   * @return the corresponding status
   */
  public ExecutionStatus computeStatus(List<ExecutionTraceStatus> statuses) {
    ExecutionStatus executionStatus;
    int successCount = 0, errorCount = 0, partialCount = 0, maybePreventedCount = 0;

    // Counting the successes, errors, partials and maybe prevented
    for (ExecutionTraceStatus status : statuses) {
      switch (status) {
        case SUCCESS, WARNING, ASSET_AGENTLESS -> successCount++;
        case PARTIAL -> partialCount++;
        case ERROR, COMMAND_NOT_FOUND, AGENT_INACTIVE -> errorCount++;
        case MAYBE_PREVENTED, MAYBE_PARTIAL_PREVENTED, COMMAND_CANNOT_BE_EXECUTED ->
            maybePreventedCount++;
      }
    }

    // Depending on the results, we deduce a status
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
