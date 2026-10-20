package io.openaev.utils;

import io.openaev.database.model.*;
import io.openaev.rest.inject.form.InjectExecutionAction;
import jakarta.annotation.Nullable;
import java.time.Duration;
import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Utility class for execution trace conversions.
 *
 * <p>Provides methods for converting between different execution status and action enumerations
 * used in inject execution tracking.
 *
 * <p>This is a utility class and cannot be instantiated.
 *
 * @see io.openaev.database.model.ExecutionTraceStatus
 * @see io.openaev.database.model.ExecutionTraceAction
 */
public class ExecutionTraceUtils {

  // EnumSet, not Set.of: contains(null) is false instead of throwing on a trace without status
  private static final Set<ExecutionTraceStatus> PLATFORM_CLOSING_STATUSES =
      java.util.EnumSet.of(
          ExecutionTraceStatus.TIMEOUT,
          ExecutionTraceStatus.INTERRUPTED,
          ExecutionTraceStatus.LATE);

  private ExecutionTraceUtils() {}

  // -- CONVERSION --

  /**
   * Converts an inject execution action to its corresponding trace action.
   *
   * @param action the inject execution action to convert
   * @return the corresponding execution trace action, defaults to EXECUTION for unmapped actions
   */
  public static ExecutionTraceAction convertExecutionAction(InjectExecutionAction action) {
    return switch (action) {
      case prerequisite_check -> ExecutionTraceAction.PREREQUISITE_CHECK;
      case prerequisite_execution -> ExecutionTraceAction.PREREQUISITE_EXECUTION;
      case cleanup_execution -> ExecutionTraceAction.CLEANUP_EXECUTION;
      case complete -> ExecutionTraceAction.COMPLETE;
      default -> ExecutionTraceAction.EXECUTION;
    };
  }

  // -- QUERY --

  /** Returns the IDs of agents that already have a COMPLETE trace. */
  public static Set<String> getCompletedAgentIds(List<ExecutionTrace> traces) {
    return traces.stream()
        .filter(t -> ExecutionTraceAction.COMPLETE.equals(t.getAction()))
        .filter(t -> t.getAgent() != null)
        .map(t -> t.getAgent().getId())
        .collect(Collectors.toSet());
  }

  /**
   * Returns the COMPLETE traces with at most one per agent (the earliest in list order, which is
   * the one that closed the agent). Agent-less COMPLETE traces are all kept: injectors may
   * legitimately report several of them.
   *
   * <p>Used to compute the inject status, so that a duplicate COMPLETE (late or retried callback)
   * can never contradict the trace that already closed the agent.
   */
  public static List<ExecutionTrace> getCompleteTracesOnePerAgent(List<ExecutionTrace> traces) {
    Set<String> seenAgentIds = new HashSet<>();
    return traces.stream()
        .filter(t -> ExecutionTraceAction.COMPLETE.equals(t.getAction()))
        .filter(t -> t.getAgent() == null || seenAgentIds.add(t.getAgent().getId()))
        .toList();
  }

  /**
   * Finds the COMPLETE trace that already closed the given agent. For an agent-less callback only a
   * platform-written closing trace (TIMEOUT, INTERRUPTED or LATE) counts, since injectors may
   * legitimately send several agent-less COMPLETE traces.
   */
  public static Optional<ExecutionTrace> findClosingCompleteTrace(
      List<ExecutionTrace> traces, @Nullable Agent agent) {
    return traces.stream()
        .filter(t -> ExecutionTraceAction.COMPLETE.equals(t.getAction()))
        .filter(
            t ->
                agent == null
                    ? t.getAgent() == null && PLATFORM_CLOSING_STATUSES.contains(t.getStatus())
                    : t.getAgent() != null && agent.getId().equals(t.getAgent().getId()))
        .findFirst();
  }

  /**
   * Finds the agent-less COMPLETE trace through which the platform closed the whole inject (agent
   * timeout on an agent-less inject, simulation timeout or interruption).
   */
  public static Optional<ExecutionTrace> findPlatformClosingTrace(List<ExecutionTrace> traces) {
    return findClosingCompleteTrace(traces, null);
  }

  // -- TRACE BUILDERS --

  /**
   * Adds a COMPLETE/TIMEOUT trace to the given inject status for an agent that did not respond
   * within the configured threshold.
   */
  public static void addTimeoutTrace(InjectStatus status, Agent agent, int thresholdMinutes) {
    status.addTrace(
        ExecutionTraceStatus.TIMEOUT,
        "Agent "
            + agent.getExecutedByUser()
            + " did not respond within the "
            + thresholdMinutes
            + " minutes threshold.",
        ExecutionTraceAction.COMPLETE,
        agent);
  }

  /**
   * Turns the TIMEOUT trace that closed an agent into a LATE one when the agent finally reports
   * back. The reported status and message are folded into the trace message together with the
   * arrival delay, so the agent keeps a single terminal trace.
   *
   * @param timeoutTrace the COMPLETE/TIMEOUT trace written by the platform
   * @param lateTrace the COMPLETE trace received after the timeout (not persisted)
   * @param arrival when the late trace reached the platform
   */
  public static void markTimeoutTraceAsLate(
      ExecutionTrace timeoutTrace, ExecutionTrace lateTrace, Instant arrival) {
    String delay =
        timeoutTrace.getTime() == null
            ? ""
            : " "
                + Math.max(0, Duration.between(timeoutTrace.getTime(), arrival).toSeconds())
                + "s";
    String reported = lateTrace.getMessage() == null ? "" : ": " + lateTrace.getMessage();
    timeoutTrace.setStatus(ExecutionTraceStatus.LATE);
    timeoutTrace.setMessage(
        timeoutTrace.getMessage()
            + " It finally reported "
            + lateTrace.getStatus()
            + delay
            + " after the timeout"
            + reported);
  }

  /**
   * Marks the COMPLETE trace of an agent that reports back after the platform already closed the
   * whole inject (simulation timeout or interruption). The trace is kept as the agent's single
   * terminal trace, as LATE, with the status it reported folded into the message.
   *
   * @param lateTrace the COMPLETE trace received after the inject was closed (about to be stored)
   */
  public static void markAsLateAfterPlatformClose(ExecutionTrace lateTrace) {
    String reported = lateTrace.getMessage() == null ? "" : ": " + lateTrace.getMessage();
    lateTrace.setMessage(
        "The agent reported "
            + lateTrace.getStatus()
            + " after the inject was closed by the platform"
            + reported);
    lateTrace.setStatus(ExecutionTraceStatus.LATE);
  }

  public static void addSimulationTimeoutTrace(InjectStatus status) {
    status.addTrace(
        ExecutionTraceStatus.TIMEOUT,
        "Inject stopped due to simulation timeout.",
        ExecutionTraceAction.COMPLETE,
        null);
  }

  public static void addSimulationInterruptedTrace(InjectStatus status) {
    status.addTrace(
        ExecutionTraceStatus.INTERRUPTED,
        "Inject stopped due to simulation interruption.",
        ExecutionTraceAction.COMPLETE,
        null);
  }

  public static void addSimulationNoMoreProgressTrace(InjectStatus status) {
    status.addTrace(
        ExecutionTraceStatus.INTERRUPTED,
        "Inject stopped due to simulation reaching no more progress.",
        ExecutionTraceAction.COMPLETE,
        null);
  }

  /**
   * Adds an agentless COMPLETE/TIMEOUT trace for an inject that has no agent to attribute a timeout
   * to (network scanners such as Nuclei target assets without an agent). Without it, a
   * stuck-PENDING agentless inject is finalized ERROR from an empty COMPLETE-trace list and the UI
   * shows a red inject with no explanation beyond the initial "waiting to be consumed" trace.
   */
  public static void addAgentlessTimeoutTrace(InjectStatus status, int thresholdMinutes) {
    status.addTrace(
        ExecutionTraceStatus.TIMEOUT,
        "The inject did not complete within the "
            + thresholdMinutes
            + " minutes threshold and was marked as timed out.",
        ExecutionTraceAction.COMPLETE,
        null);
  }

  /**
   * Adds a START/INFO trace to the given inject status indicating that an implant was spawned by
   * the agent.
   */
  public static void addJobRetrievalTrace(InjectStatus status, Agent agent) {
    status.addTrace(
        ExecutionTraceStatus.INFO, "Implant spawn by the agent", ExecutionTraceAction.START, agent);
  }

  // -- STATUS COMPUTATION --

  /**
   * Compute the aggregated status from all traces of a single agent. The logic is:
   *
   * <ul>
   *   <li>Non-cleanup errors take priority → return the granular error status
   *   <li>Prerequisite failed → PREREQUISITE_FAILED
   *   <li>If execution succeeded but cleanup failed → EXECUTED_WITH_CLEANUP_FAILURE
   *   <li>If all succeeded → EXECUTED
   * </ul>
   */
  public static ExecutionTraceStatus computeAgentTraceStatus(List<ExecutionTrace> agentTraces) {
    boolean hasSuccess = false;
    boolean hasCleanupError = false;
    boolean hasPrerequisiteError = false;
    Set<ExecutionTraceStatus> executionErrors =
        java.util.EnumSet.noneOf(ExecutionTraceStatus.class);

    for (ExecutionTrace trace : agentTraces) {
      ExecutionTraceStatus status = trace.getStatus();
      if (status.isSuccess()) {
        hasSuccess = true;
      } else if (status.isError()) {
        switch (trace.getAction()) {
          case CLEANUP_EXECUTION -> hasCleanupError = true;
          case PREREQUISITE_EXECUTION, PREREQUISITE_CHECK -> hasPrerequisiteError = true;
          default -> executionErrors.add(status);
        }
      }
    }

    // Non-cleanup, non-prerequisite error takes priority
    if (!executionErrors.isEmpty()) {
      return executionErrors.size() == 1
          ? executionErrors.iterator().next()
          : ExecutionTraceStatus.ERROR;
    }
    if (hasPrerequisiteError) {
      return ExecutionTraceStatus.PREREQUISITE_FAILED;
    }
    if (hasSuccess && hasCleanupError) {
      return ExecutionTraceStatus.EXECUTED_WITH_CLEANUP_FAILURE;
    }
    if (hasSuccess) {
      return ExecutionTraceStatus.EXECUTED;
    }
    return null;
  }
}
