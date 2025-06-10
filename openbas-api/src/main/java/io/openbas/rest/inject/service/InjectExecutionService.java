package io.openbas.rest.inject.service;

import static io.openbas.utils.InjectExecutionUtils.convertExecutionAction;
import static io.openbas.utils.InjectExecutionUtils.convertExecutionStatus;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.database.model.*;
import io.openbas.database.repository.AgentRepository;
import io.openbas.database.repository.InjectExecutionRepository;
import io.openbas.database.repository.InjectRepository;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.finding.FindingService;
import io.openbas.rest.inject.form.InjectExecutionInput;
import io.openbas.rest.inject.form.InjectUpdateStatusInput;
import io.openbas.utils.InjectUtils;
import jakarta.annotation.Nullable;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.*;
import java.util.logging.Level;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
@Log
public class InjectExecutionService {

  private final InjectRepository injectRepository;
  private final AgentRepository agentRepository;
  private final FindingService findingService;
  private final StructuredOutputUtils structuredOutputUtils;
  private final InjectService injectService;
  private final InjectUtils injectUtils;
  private final InjectExecutionRepository injectExecutionRepository;

  public List<InjectExecution> findPendingInjectStatusByType(String injectType) {
    return this.injectExecutionRepository.pendingForInjectType(injectType);
  }

  @Transactional(rollbackOn = Exception.class)
  public Inject updateInjectStatus(String injectId, InjectUpdateStatusInput input) {
    Inject inject = injectRepository.findById(injectId).orElseThrow();
    // build status
    InjectExecution injectExecution = new InjectExecution();
    injectExecution.setInject(inject);
    injectExecution.setName(ExecutionStatus.valueOf(input.getStatus()));
    // Save status for inject
    inject.setExecutions(new ArrayList<>(Arrays.asList(injectExecution)));
    return injectRepository.save(inject);
  }

  public void addStartImplantExecutionTraceByInject(
      String injectId, String agentId, String message) {
    InjectExecution injectExecution =
        injectExecutionRepository
            .findByInjectId(injectId)
            .orElseThrow(ElementNotFoundException::new);
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
    injectExecutionRepository.save(injectExecution);
  }

  private int getCompleteTrace(Inject inject) {
    return inject
        .getExecution()
        .map(InjectExecution::getTraces)
        .orElse(Collections.emptyList())
        .stream()
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
    ExecutionStatus finalStatus =
        computeStatus(
            injectExecution.getTraces().stream()
                .filter(t -> ExecutionTraceAction.COMPLETE.equals(t.getAction()))
                .toList());
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
    InjectExecution injectExecution =
        inject.getExecution().orElseThrow(ElementNotFoundException::new);

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
    if (!execution.getTraces().isEmpty()) {
      List<ExecutionTrace> traces =
          execution.getTraces().stream().peek(t -> t.setInjectExecution(injectExecution)).toList();
      injectExecution.getTraces().addAll(traces);
    }
    if (execution.isAsync() && ExecutionStatus.EXECUTING.equals(injectExecution.getName())) {
      injectExecution.setName(ExecutionStatus.PENDING);
    } else {
      updateFinalInjectStatus(injectExecution);
    }
    return injectExecution;
  }

  private InjectExecution getOrInitializeInjectStatus(Inject inject) {
    return inject
        .getExecution()
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
    return injectExecutionRepository.save(injectExecution);
  }

  @Transactional
  public InjectExecution initializeInjectStatus(
      @NotNull String injectId, @NotNull ExecutionStatus status) {
    Inject inject = this.injectRepository.findById(injectId).orElseThrow();
    InjectExecution injectExecution = getOrInitializeInjectStatus(inject);
    injectExecution.setName(status);
    injectExecution.setTrackingSentDate(Instant.now());
    injectExecution.setPayloadOutput(injectUtils.getStatusPayloadFromInject(inject));
    return injectExecutionRepository.save(injectExecution);
  }

  public Iterable<InjectExecution> saveAll(@NotNull List<InjectExecution> injectExecutions) {
    return this.injectExecutionRepository.saveAll(injectExecutions);
  }

  public void handleInjectExecutionCallback(
      String injectId, String agentId, InjectExecutionInput input) {
    Inject inject = null;

    try {
      inject = loadInjectOrThrow(injectId);
      Agent agent = loadAgentIfPresent(agentId);

      Set<OutputParser> outputParsers = structuredOutputUtils.extractOutputParsers(inject);
      Optional<ObjectNode> structuredOutput =
          structuredOutputUtils.computeStructuredOutput(outputParsers, input);

      processInjectExecution(inject, agent, input, outputParsers, structuredOutput);
    } catch (ElementNotFoundException | JsonProcessingException e) {
      handleInjectExecutionError(inject, e);
    }
  }

  /** Processes the execution of an inject by updating its status and extracting findings. */
  private void processInjectExecution(
      Inject inject,
      Agent agent,
      InjectExecutionInput input,
      Set<OutputParser> outputParsers,
      Optional<ObjectNode> structuredOutput) {

    ObjectNode structured = structuredOutput.orElse(null);
    updateInjectStatus(agent, inject, input, structured);

    if (structured != null) {
      if (agent != null) {
        // Extract findings from structured outputs generated by the output parsers specified in the
        // payload, typically derived from the raw output of the implant execution.
        findingService.extractFindingsFromOutputParsers(inject, agent, outputParsers, structured);
      } else {
        // Structured output directly provided (e.g., from injectors)
        findingService.extractFindingsFromInjectorContract(inject, structured);
      }
    }
  }

  private Agent loadAgentIfPresent(String agentId) {
    return (agentId == null)
        ? null
        : agentRepository
            .findById(agentId)
            .orElseThrow(() -> new ElementNotFoundException("Agent not found: " + agentId));
  }

  private Inject loadInjectOrThrow(String injectId) {
    return injectRepository
        .findById(injectId)
        .orElseThrow(() -> new ElementNotFoundException("Inject not found: " + injectId));
  }

  private void handleInjectExecutionError(Inject inject, Exception e) {
    log.log(Level.SEVERE, e.getMessage());
    if (inject != null) {
      inject
          .getExecution()
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
      injectRepository.save(inject);
    }
  }
}
