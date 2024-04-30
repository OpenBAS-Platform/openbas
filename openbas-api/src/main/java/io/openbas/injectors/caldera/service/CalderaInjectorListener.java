package io.openbas.injectors.caldera.service;

import io.openbas.asset.AssetGroupService;
import io.openbas.database.model.ExecutionStatus;
import io.openbas.database.model.Inject;
import io.openbas.database.model.InjectStatus;
import io.openbas.database.repository.InjectRepository;
import io.openbas.database.repository.InjectStatusRepository;
import io.openbas.injectors.caldera.CalderaContract;
import io.openbas.injectors.caldera.model.ResultStatus;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

import static io.openbas.database.model.InjectStatusExecution.traceError;
import static io.openbas.database.model.InjectStatusExecution.traceInfo;

@Service
@RequiredArgsConstructor
public class CalderaInjectorListener {

  private final InjectRepository injectRepository;
  private final InjectStatusRepository injectStatusRepository;
  private final CalderaInjectorService calderaService;
  private final AssetGroupService assetGroupService;

  @Scheduled(fixedDelay = 60000, initialDelay = 0)
  @Transactional
  public void listenAbilities() {
    // Retrieve Caldera inject not done
    List<InjectStatus> injectStatuses = this.injectStatusRepository.pendingForInjectType(CalderaContract.TYPE);
    // For each one ask for traces and status
    injectStatuses.forEach((injectStatus -> {
      // Add traces and close inject if needed.
      Instant finalExecutionTime = injectStatus.getTrackingSentDate();

      List<String> linkIds = injectStatus.statusIdentifiers();
      List<ResultStatus> completedActions = new ArrayList<>();
      for (String linkId : linkIds) {
        try {
          ResultStatus resultStatus = this.calderaService.results(linkId);

          if (resultStatus.isComplete()) {
            completedActions.add(resultStatus);

            injectStatus.setTrackingTotalSuccess(injectStatus.getTrackingTotalSuccess() + 1);

            // Compute biggest execution time
            if (resultStatus.getFinish().isAfter(finalExecutionTime)) {
              finalExecutionTime = resultStatus.getFinish();
            }
            // TimeOut
          } else if (injectStatus.getTrackingSentDate().isBefore(Instant.now().minus(5L, ChronoUnit.MINUTES))) {
            resultStatus.setFail(true);
            completedActions.add(resultStatus);

            injectStatus.setTrackingTotalError(injectStatus.getTrackingTotalSuccess() + 1);
          }
        } catch (Exception e) {
          injectStatus.getTraces().add(
              traceError("Caldera error to execute ability")
          );
        }
      }

      // Compute status only if all actions are completed
      if (completedActions.size() == linkIds.size()) {
        int failedActions = (int) completedActions.stream().filter(ResultStatus::isFail).count();
        computeInjectStatus(injectStatus, finalExecutionTime, completedActions.size(), failedActions);
        // Update related inject
        computeInject(injectStatus);
      }
    }));
  }

  // -- INJECT STATUS --

  private void computeInjectStatus(
      @NotNull final InjectStatus injectStatus,
      @NotNull final Instant finalExecutionTime,
      final int completedActions,
      final int failedActions) {
    boolean hasError = injectStatus.getTraces().stream()
        .anyMatch(trace -> trace.getStatus().equals(ExecutionStatus.ERROR));
    injectStatus.setName(hasError ? ExecutionStatus.ERROR : ExecutionStatus.SUCCESS);
    injectStatus.getTraces().add(
        traceInfo("caldera",
            "Caldera success to execute ability on " + (completedActions - failedActions)
                + "/" + completedActions + " asset(s)")
    );
    long executionTime = (finalExecutionTime.toEpochMilli() - injectStatus.getTrackingSentDate().toEpochMilli());
    injectStatus.setTrackingTotalExecutionTime(executionTime);
    this.injectStatusRepository.save(injectStatus);
  }

  // -- INJECT --

  private void computeInject(@NotNull final InjectStatus injectStatus) {
    Inject relatedInject = injectStatus.getInject();
    relatedInject.setUpdatedAt(Instant.now());
    this.injectRepository.save(relatedInject);
  }

}
