package io.openbas.rest.inject.service;

import static java.time.Instant.now;

import io.openbas.database.model.*;
import io.openbas.database.model.InjectStatus;
import io.openbas.database.repository.AgentRepository;
import io.openbas.database.repository.InjectRepository;
import io.openbas.database.repository.InjectStatusRepository;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.inject.form.InjectExecutionActionInput;
import io.openbas.rest.inject.form.InjectExecutionInput;
import io.openbas.rest.inject.form.InjectUpdateStatusInput;
import io.openbas.utils.InjectUtils;
import jakarta.annotation.Nullable;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class InjectStatusService {
  private final InjectRepository injectRepository;
  private final AgentRepository agentRepository;
  private final InjectUtils injectUtils;
  private final InjectStatusRepository injectStatusRepository;

  @Transactional(rollbackOn = Exception.class)
  public Inject updateInjectStatus(String injectId, InjectUpdateStatusInput input) {
    Inject inject = injectRepository.findById(injectId).orElseThrow();
    // build status
    InjectStatus injectStatus = new InjectStatus();
    injectStatus.setInject(inject);
    injectStatus.setTrackingSentDate(now());
    injectStatus.setName(ExecutionStatus.valueOf(input.getStatus()));
    // Save status for inject
    inject.setStatus(injectStatus);
    return injectRepository.save(inject);
  }

  private ExecutionTraceStatus convertExecutionStatus(ExecutionStatus status) {
    return switch (status) {
      case SUCCESS -> ExecutionTraceStatus.SUCCESS;
      case ERROR -> ExecutionTraceStatus.ERROR;
      case MAYBE_PREVENTED -> ExecutionTraceStatus.MAYBE_PREVENTED;
      case PARTIAL -> ExecutionTraceStatus.PARTIAL;
      case MAYBE_PARTIAL_PREVENTED -> ExecutionTraceStatus.MAYBE_PARTIAL_PREVENTED;
      default -> null;
    };
  }

  private ExecutionTraceAction convertExecutionAction(InjectExecutionActionInput status) {
    return switch (status) {
      case InjectExecutionActionInput.prerequisite_check -> ExecutionTraceAction.PREREQUISITE_CHECK;
      case InjectExecutionActionInput.prerequisite_execution ->
          ExecutionTraceAction.PREREQUISITE_EXECUTION;
      case InjectExecutionActionInput.cleanup_execution -> ExecutionTraceAction.CLEANUP_EXECUTION;
      case InjectExecutionActionInput.complete -> ExecutionTraceAction.COMPLETE;
      default -> ExecutionTraceAction.EXECUTION;
    };
  }

  private Set<Agent> getCompleteTraceAgents(Inject inject) {
    return inject.getStatus().map(InjectStatus::getTraces).orElse(Collections.emptyList()).stream()
        .filter(trace -> ExecutionTraceAction.COMPLETE.equals(trace.getAction()))
        .map(ExecutionTraces::getAgent)
        .collect(Collectors.toSet());
  }

  private int calculateTotalAssets(Inject inject) {
    int assetCount = Optional.ofNullable(inject.getAssets()).map(List::size).orElse(0);
    int groupAssetCount =
        Optional.ofNullable(inject.getAssetGroups())
            .map(
                groups ->
                    groups.stream()
                        .mapToInt(
                            group ->
                                Optional.ofNullable(group.getAssets()).map(List::size).orElse(0))
                        .sum())
            .orElse(0);
    return assetCount + groupAssetCount;
  }

  public boolean isAllInjectAssetsExecuted(Inject inject) {
    Set<Agent> completeTraceUniqueAgent = getCompleteTraceAgents(inject);
    int totalAssetCount = calculateTotalAssets(inject);
    return totalAssetCount == completeTraceUniqueAgent.size();
  }

  public void updateFinalInjectStatus(InjectStatus injectStatus, Instant finishTime) {
    ExecutionTraceStatus processFinishTraceStatus =
        injectStatus.getTraces().stream()
            .filter(t -> ExecutionTraceAction.PROCESS_FINISH.equals(t.getAction()))
            .map(ExecutionTraces::getStatus)
            .findFirst()
            .orElse(null);

    ExecutionStatus finalStatus;
    if (processFinishTraceStatus != null) {
      finalStatus =
          processFinishTraceStatus.equals(ExecutionTraceStatus.SUCCESS)
              ? ExecutionStatus.SUCCESS
              : ExecutionStatus.ERROR;
    } else {
      finalStatus =
          computeStatus(
              injectStatus.getTraces().stream()
                  .filter(t -> ExecutionTraceAction.COMPLETE.equals(t.getAction()))
                  .toList());
    }

    injectStatus.addTrace(
        ExecutionTraceStatus.INFO, "Process finish", ExecutionTraceAction.PROCESS_FINISH, null);
    injectStatus.setTrackingEndDate(finishTime == null ? Instant.now() : finishTime);
    injectStatus.setName(finalStatus);
    injectStatus.getInject().setUpdatedAt(Instant.now());
  }

  public Inject handleInjectExecutionCallbak(
      String injectId, String agentId, InjectExecutionInput input) {
    Inject inject = injectRepository.findById(injectId).orElseThrow(ElementNotFoundException::new);
    Agent agent = agentRepository.findById(agentId).orElseThrow(ElementNotFoundException::new);
    InjectStatus injectStatus = inject.getStatus().orElseThrow(ElementNotFoundException::new);

    ExecutionTraceAction executionAction = convertExecutionAction(input.getAction());
    ExecutionTraceStatus traceStatus;
    if (executionAction.equals(ExecutionTraceAction.COMPLETE)) {
      traceStatus =
          convertExecutionStatus(
              computeStatus(
                  injectStatus.getTraces().stream()
                      .filter(t -> t.getAgent().getId().equals(agentId))
                      .toList()));
    } else {
      traceStatus = ExecutionTraceStatus.valueOf(input.getStatus());
    }
    injectStatus
        .getTraces()
        .add(
            new ExecutionTraces(
                injectStatus, traceStatus, null, input.getMessage(), executionAction, agent));

    if (executionAction.equals(ExecutionTraceAction.COMPLETE)
        && isAllInjectAssetsExecuted(inject)) {
      updateFinalInjectStatus(injectStatus, now());
    }
    return injectRepository.save(inject);
  }

  public ExecutionStatus computeStatus(List<ExecutionTraces> traces) {
    ExecutionStatus executionStatus;
    int successCount = 0, errorCount = 0, partialCount = 0, maybePreventedCount = 0;

    for (ExecutionTraces trace : traces) {
      switch (trace.getStatus()) {
        case SUCCESS, WARNING -> successCount++;
        case PARTIAL -> partialCount++;
        case ERROR, COMMAND_NOT_FOUND, ASSET_INACTIVE -> errorCount++;
        case MAYBE_PREVENTED, MAYBE_PARTIAL_PREVENTED, COMMAND_CANNOT_BE_EXECUTED ->
            maybePreventedCount++;
      }
    }

    if (successCount > 0 && errorCount == 0 && maybePreventedCount == 0 & partialCount == 0) {
      executionStatus = ExecutionStatus.SUCCESS;
    } else if (errorCount > 0
        && successCount == 0
        && maybePreventedCount == 0 & partialCount == 0) {
      executionStatus = ExecutionStatus.ERROR;
    } else if (maybePreventedCount > 0
        && successCount == 0
        && errorCount == 0 & partialCount == 0) {
      executionStatus = ExecutionStatus.MAYBE_PREVENTED;
    } else if (partialCount > 0 && errorCount == 0 & maybePreventedCount == 0 || successCount > 0) {
      executionStatus = ExecutionStatus.PARTIAL;
    } else {
      executionStatus = ExecutionStatus.MAYBE_PARTIAL_PREVENTED;
    }
    return executionStatus;
  }

  public InjectStatus fromExecution(Execution execution, Inject executedInject) {
    InjectStatus injectStatus = executedInject.getStatus().orElse(new InjectStatus());
    injectStatus.setTrackingSentDate(Instant.now());
    injectStatus.setInject(executedInject);

    if (!execution.getTraces().isEmpty()) {
      List<ExecutionTraces> traces =
          execution.getTraces().stream().peek(t -> t.setInjectStatus(injectStatus)).toList();
      injectStatus.getTraces().addAll(traces);
    }

    if (execution.isAsync()) {
      injectStatus.setName(ExecutionStatus.PENDING);
    } else {
      updateFinalInjectStatus(injectStatus, now());
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

  public InjectStatus failInjectStatus(Inject inject, @Nullable String message) {
    InjectStatus injectStatus = getOrInitializeInjectStatus(inject);
    if (message != null) {
      injectStatus.addErrorTrace(message, ExecutionTraceAction.PROCESS_FINISH);
    }
    injectStatus.setName(ExecutionStatus.ERROR);
    injectStatus.setTrackingEndDate(Instant.now());
    injectStatus.setPayloadOutput(injectUtils.getStatusPayloadFromInject(inject));
    return injectStatusRepository.save(injectStatus);
  }

  @Transactional
  public void initializeInjectStatus(
      @NotNull Inject inject, @NotNull ExecutionStatus status, @Nullable ExecutionTraces trace) {
    InjectStatus injectStatus = getOrInitializeInjectStatus(inject);

    if (trace != null) {
      injectStatus.addTrace(trace);
    }
    injectStatus.setName(status);
    injectStatus.setTrackingSentDate(Instant.now());
    injectStatus.setPayloadOutput(injectUtils.getStatusPayloadFromInject(inject));
    injectStatusRepository.save(injectStatus);
  }
}
