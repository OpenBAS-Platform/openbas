package io.openbas.injectors.caldera.service;

import static io.openbas.database.model.InjectStatusExecution.*;

import io.openbas.database.model.ExecutionStatus;
import io.openbas.database.model.ExecutionTraceStatus;
import io.openbas.database.model.Inject;
import io.openbas.database.model.InjectStatus;
import io.openbas.database.repository.InjectRepository;
import io.openbas.database.repository.InjectStatusRepository;
import io.openbas.injectors.caldera.CalderaContract;
import io.openbas.injectors.caldera.model.ResultStatus;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Log
@Service
public class CalderaResultCollectorService implements Runnable {
  private final int EXPIRATION_TIME = 900;

  private final InjectRepository injectRepository;
  private final InjectStatusRepository injectStatusRepository;
  private final CalderaInjectorService calderaService;

  @Autowired
  public CalderaResultCollectorService(
      InjectRepository injectRepository,
      InjectStatusRepository injectStatusRepository,
      CalderaInjectorService calderaService) {
    this.injectRepository = injectRepository;
    this.injectStatusRepository = injectStatusRepository;
    this.calderaService = calderaService;
  }

  @Override
  @Transactional
  public void run() {
    // Retrieve Caldera inject not done
    List<InjectStatus> injectStatuses =
        this.injectStatusRepository.pendingForInjectType(CalderaContract.TYPE);
    // For each one ask for traces and status
    injectStatuses.forEach(
        (injectStatus -> {
          log.log(Level.INFO, "Found inject status: " + injectStatus.getId());
          // Add traces and close inject if needed.
          Instant finalExecutionTime = injectStatus.getTrackingSentDate();
          List<String> linkIds = injectStatus.statusIdentifiers();
          if (linkIds.isEmpty()) {
            computeInjectStatus(injectStatus, finalExecutionTime, 0, 0);
            computeInject(injectStatus);
          } else {
            log.log(Level.INFO, "Found links IDs: " + linkIds);
            List<ResultStatus> completedActions = new ArrayList<>();
            for (String linkId : linkIds) {
              ResultStatus resultStatus = new ResultStatus();
              try {
                log.log(Level.INFO, "Trying to get result for " + linkId);
                resultStatus = this.calderaService.results(linkId);
              } catch (Exception e) {
                injectStatus
                    .getTraces()
                    .add(
                        traceMaybePrevented(
                            "Cannot get result for linkID " + linkId + ", injection has failed"));
                log.log(
                    Level.INFO,
                    "Cannot get result for linkID " + linkId + ", injection has failed");
                resultStatus.setFail(true);
                completedActions.add(resultStatus);
                injectStatus.setTrackingTotalError(injectStatus.getTrackingTotalError() + 1);
              }
              if (resultStatus.getPaw() == null) {
                if (injectStatus
                    .getTrackingSentDate()
                    .isBefore(Instant.now().minus(EXPIRATION_TIME / 60, ChronoUnit.MINUTES))) {
                  injectStatus
                      .getTraces()
                      .add(
                          traceMaybePrevented(
                              "Cannot get result for linkID " + linkId + ", injection has failed"));
                  log.log(
                      Level.INFO,
                      "Cannot get result for linkID " + linkId + ", injection has failed");
                  resultStatus.setFail(true);
                  completedActions.add(resultStatus);
                  injectStatus.setTrackingTotalError(injectStatus.getTrackingTotalError() + 1);
                }
              } else {
                if (resultStatus.isComplete()) {
                  completedActions.add(resultStatus);
                  if (resultStatus.isFail()) {
                    injectStatus.setTrackingTotalError(injectStatus.getTrackingTotalError() + 1);
                    injectStatus
                        .getTraces()
                        .add(
                            traceMaybePrevented(
                                "Failed result for linkID "
                                    + linkId
                                    + " ("
                                    + resultStatus.getContent()
                                    + ")"));
                  } else {
                    injectStatus.setTrackingTotalSuccess(
                        injectStatus.getTrackingTotalSuccess() + 1);
                    injectStatus
                        .getTraces()
                        .add(
                            traceSuccess(
                                "Success result for linkID "
                                    + linkId
                                    + " ("
                                    + resultStatus.getContent()
                                    + ")"));
                  }
                  // Compute biggest execution time
                  if (resultStatus.getFinish().isAfter(finalExecutionTime)) {
                    finalExecutionTime = resultStatus.getFinish();
                  }
                } else if (injectStatus
                    .getTrackingSentDate()
                    .isBefore(Instant.now().minus(5L, ChronoUnit.MINUTES))) {
                  injectStatus
                      .getTraces()
                      .add(
                          traceMaybePrevented(
                              "Timeout on linkID " + linkId + ", injection has failed"));
                  log.log(Level.INFO, "Timeout on linkID " + linkId + ", injection has failed");
                  resultStatus.setFail(true);
                  completedActions.add(resultStatus);
                  injectStatus.setTrackingTotalError(injectStatus.getTrackingTotalError() + 1);
                }
              }
            }
            // Compute status only if all actions are completed
            if (completedActions.size() == linkIds.size()) {
              int failedActions =
                  (int) completedActions.stream().filter(ResultStatus::isFail).count();
              computeInjectStatus(
                  injectStatus, finalExecutionTime, completedActions.size(), failedActions);
              // Update related inject
              computeInject(injectStatus);
            }
          }
        }));
  }

  // -- INJECT STATUS --

  public void computeInjectStatus(
      @NotNull final InjectStatus injectStatus,
      @NotNull final Instant finalExecutionTime,
      final int completedActions,
      final int failedActions) {
    if (injectStatus.getTraces().stream()
            .filter(
                injectStatusExecution ->
                    ExecutionTraceStatus.ERROR.equals(injectStatusExecution.getStatus()))
            .count()
        >= completedActions) {
      injectStatus.setName(ExecutionStatus.ERROR);
    } else if (injectStatus.getTraces().stream()
        .anyMatch(trace -> ExecutionTraceStatus.ERROR.equals(trace.getStatus()))) {
      injectStatus.setName(ExecutionStatus.PARTIAL);
    } else if (injectStatus.getTraces().stream()
            .filter(
                injectStatusExecution ->
                    ExecutionTraceStatus.MAYBE_PREVENTED.equals(injectStatusExecution.getStatus()))
            .count()
        >= completedActions) {
      injectStatus.setName(ExecutionStatus.MAYBE_PREVENTED);
    } else if (injectStatus.getTraces().stream()
        .anyMatch(trace -> ExecutionTraceStatus.MAYBE_PREVENTED.equals(trace.getStatus()))) {
      injectStatus.setName(ExecutionStatus.MAYBE_PARTIAL_PREVENTED);
    } else {
      injectStatus.setName(ExecutionStatus.SUCCESS);
    }
    injectStatus
        .getTraces()
        .add(
            traceInfo(
                "caldera",
                "Caldera executed the ability on "
                    + (completedActions - failedActions)
                    + "/"
                    + completedActions
                    + " asset(s)"));
    long executionTime =
        (finalExecutionTime.toEpochMilli() - injectStatus.getTrackingSentDate().toEpochMilli());
    injectStatus.setTrackingTotalExecutionTime(executionTime);
    injectStatus.setTrackingEndDate(Instant.now());
    this.injectStatusRepository.save(injectStatus);
  }

  // -- INJECT --

  public void computeInject(@NotNull final InjectStatus injectStatus) {
    Inject relatedInject = injectStatus.getInject();
    relatedInject.setUpdatedAt(Instant.now());
    this.injectRepository.save(relatedInject);
  }
}
