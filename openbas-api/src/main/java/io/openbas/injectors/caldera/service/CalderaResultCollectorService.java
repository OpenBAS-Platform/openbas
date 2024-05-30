package io.openbas.injectors.caldera.service;

import io.openbas.asset.EndpointService;
import io.openbas.database.model.*;
import io.openbas.database.repository.InjectRepository;
import io.openbas.database.repository.InjectStatusRepository;
import io.openbas.inject_expectation.InjectExpectationService;
import io.openbas.injectors.caldera.CalderaContract;
import io.openbas.injectors.caldera.config.CalderaInjectorConfig;
import io.openbas.injectors.caldera.model.ResultStatus;
import jakarta.validation.constraints.NotNull;
import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;

import static io.openbas.database.model.InjectStatusExecution.traceError;
import static io.openbas.database.model.InjectStatusExecution.traceInfo;

@Log
@Service
public class CalderaResultCollectorService implements Runnable {
    private final int EXPIRATION_TIME = 900;

    private final InjectRepository injectRepository;
    private final InjectStatusRepository injectStatusRepository;
    private final InjectExpectationService injectExpectationService;
    private final CalderaInjectorService calderaService;
    private final CalderaInjectorConfig calderaInjectorConfig;
    private final EndpointService endpointService;

    @Autowired
    public CalderaResultCollectorService(
            InjectRepository injectRepository,
            InjectStatusRepository injectStatusRepository,
            InjectExpectationService injectExpectationService,
            CalderaInjectorService calderaService,
            CalderaInjectorConfig calderaInjectorConfig,
            EndpointService endpointService
    ) {
        this.injectRepository = injectRepository;
        this.injectStatusRepository = injectStatusRepository;
        this.injectExpectationService = injectExpectationService;
        this.calderaService = calderaService;
        this.calderaInjectorConfig = calderaInjectorConfig;
        this.endpointService = endpointService;
    }

    @Override
    @Transactional
    public void run() {
        // Retrieve Caldera inject not done
        List<InjectStatus> injectStatuses = this.injectStatusRepository.pendingForInjectType(CalderaContract.TYPE);
        // For each one ask for traces and status
        injectStatuses.forEach((injectStatus -> {
            log.log(Level.INFO, "Found inject status: " + injectStatus);
            // Add traces and close inject if needed.
            Instant finalExecutionTime = injectStatus.getTrackingSentDate();
            List<String> linkIds = injectStatus.statusIdentifiers();
            log.log(Level.INFO, "Found links IDs: " + linkIds);
            List<ResultStatus> completedActions = new ArrayList<>();
            for (String linkId : linkIds) {
                ResultStatus resultStatus = new ResultStatus();
                try {
                    log.log(Level.INFO, "Trying to get result for " + linkId);
                    resultStatus = this.calderaService.results(linkId);
                } catch (Exception e) {
                    injectStatus.getTraces().add(traceError("Cannot get result for linkID " + linkId + ", injection has failed"));
                    resultStatus.setFail(true);
                    completedActions.add(resultStatus);
                    injectStatus.setTrackingTotalError(injectStatus.getTrackingTotalError() + 1);
                }
                if (resultStatus.getPaw() == null) {
                    if (injectStatus.getTrackingSentDate().isBefore(Instant.now().minus(EXPIRATION_TIME / 60, ChronoUnit.MINUTES))) {
                        injectStatus.getTraces().add(traceError("Cannot get result for linkID " + linkId + ", injection has failed"));
                        resultStatus.setFail(true);
                        completedActions.add(resultStatus);
                        injectStatus.setTrackingTotalError(injectStatus.getTrackingTotalError() + 1);
                    }
                } else {
                    if (resultStatus.isComplete()) {
                        completedActions.add(resultStatus);
                        injectStatus.setTrackingTotalSuccess(injectStatus.getTrackingTotalSuccess() + 1);
                        // Compute biggest execution time
                        if (resultStatus.getFinish().isAfter(finalExecutionTime)) {
                            finalExecutionTime = resultStatus.getFinish();
                        }
                    } else if (injectStatus.getTrackingSentDate().isBefore(Instant.now().minus(5L, ChronoUnit.MINUTES))) {
                        injectStatus.getTraces().add(traceError("Timeout on linkID " + linkId + ", injection has failed"));
                        resultStatus.setFail(true);
                        completedActions.add(resultStatus);
                        injectStatus.setTrackingTotalError(injectStatus.getTrackingTotalError() + 1);
                    }
                }
            }
            // Compute status only if all actions are completed
            if (!linkIds.isEmpty() && completedActions.size() == linkIds.size()) {
                int failedActions = (int) completedActions.stream().filter(ResultStatus::isFail).count();
                computeInjectStatus(injectStatus, finalExecutionTime, completedActions.size(), failedActions);
                // Update related inject
                computeInject(injectStatus);
            }
        }));
    }

    // -- INJECT STATUS --

    @Transactional
    public void computeInjectStatus(
            @NotNull final InjectStatus injectStatus,
            @NotNull final Instant finalExecutionTime,
            final int completedActions,
            final int failedActions) {
        boolean hasError = injectStatus.getTraces().stream().anyMatch(trace -> trace.getStatus().equals(ExecutionStatus.ERROR));
        injectStatus.setName(hasError ? ExecutionStatus.ERROR : ExecutionStatus.SUCCESS);
        injectStatus.getTraces().add(
                traceInfo("caldera",
                        "Caldera success to execute ability on " + (completedActions - failedActions)
                                + "/" + completedActions + " asset(s)")
        );
        long executionTime = (finalExecutionTime.toEpochMilli() - injectStatus.getTrackingSentDate().toEpochMilli());
        injectStatus.setTrackingTotalExecutionTime(executionTime);
        injectStatus.setTrackingEndDate(Instant.now());
        this.injectStatusRepository.save(injectStatus);
    }

    // -- INJECT --

    @Transactional
    public void computeInject(@NotNull final InjectStatus injectStatus) {
        Inject relatedInject = injectStatus.getInject();
        relatedInject.setUpdatedAt(Instant.now());
        this.injectRepository.save(relatedInject);
    }

}
