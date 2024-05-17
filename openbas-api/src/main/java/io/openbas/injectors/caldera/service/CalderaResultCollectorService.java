package io.openbas.injectors.caldera.service;

import io.openbas.asset.EndpointService;
import io.openbas.database.model.*;
import io.openbas.database.repository.InjectRepository;
import io.openbas.database.repository.InjectStatusRepository;
import io.openbas.inject_expectation.InjectExpectationService;
import io.openbas.injectors.caldera.CalderaContract;
import io.openbas.injectors.caldera.config.CalderaInjectorConfig;
import io.openbas.injectors.caldera.model.ResultStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static io.openbas.database.model.InjectStatusExecution.traceError;
import static io.openbas.database.model.InjectStatusExecution.traceInfo;
import static io.openbas.inject_expectation.InjectExpectationUtils.resultsBySourceId;

@Log
@Service
public class CalderaResultCollectorService implements Runnable {

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
            Inject inject = injectStatus.getInject();

            // Verify if the inject is still valid
            if (injectStatus.getTrackingSentDate().isBefore(Instant.now().minus(calderaInjectorConfig.getExpirationTimeInMinute(), ChronoUnit.MINUTES))) {
                injectStatus.getTraces().add(
                        traceError("This inject has expired")
                );
                injectStatus.setTrackingTotalError(Optional.ofNullable(injectStatus.getTrackingTotalError()).map(value -> value + 1).orElse(0));
                // Update injectStatus to expired status -> Error
                computeInjectStatus(injectStatus, injectStatus.getTrackingSentDate());
                // Update related inject
                computeInject(injectStatus);
            } else {
                // Add traces and close inject if needed.
                Instant finalExecutionTime = injectStatus.getTrackingSentDate();

                List<String> linkIds = injectStatus.statusIdentifiers();
                List<ResultStatus> completedActions = new ArrayList<>();
                for (String linkId : linkIds) {
                    try {
                        ResultStatus resultStatus = this.calderaService.results(linkId);
                        if (resultStatus.getPaw() == null) {
                            injectStatus.getTraces().add(traceInfo("Results are not yet available (still on-going)"));
                        } else {
                            Endpoint currentEndpoint = this.endpointService.findByExternalReference(resultStatus.getPaw()).orElseThrow();
                            String currentAssetId = currentEndpoint.getId();
                            if (resultStatus.isComplete()) {
                                completedActions.add(resultStatus);
                                computeExpectationForAsset(inject, currentAssetId, resultStatus.isFail(), resultStatus.getContent());
                                injectStatus.setTrackingTotalSuccess(injectStatus.getTrackingTotalSuccess() + 1);
                                // Compute biggest execution time
                                if (resultStatus.getFinish().isAfter(finalExecutionTime)) {
                                    finalExecutionTime = resultStatus.getFinish();
                                }
                            } else if (injectStatus.getTrackingSentDate().isBefore(Instant.now().minus(5L, ChronoUnit.MINUTES))) {
                                resultStatus.setFail(true);
                                completedActions.add(resultStatus);
                                computeExpectationForAsset(inject, currentAssetId, resultStatus.isFail(), "Time out");
                                injectStatus.setTrackingTotalError(injectStatus.getTrackingTotalSuccess() + 1);
                            }
                        }
                    } catch (Exception e) {
                        injectStatus.getTraces().add(
                                traceError("Caldera failed to get result of the executed ability")
                        );
                    }
                }

                // Compute status only if all actions are completed
                if (!linkIds.isEmpty() && completedActions.size() == linkIds.size()) {
                    int failedActions = (int) completedActions.stream().filter(ResultStatus::isFail).count();
                    injectStatus.getTraces().add(
                            traceInfo("caldera",
                                    "Caldera success to execute ability on " + (completedActions.size() - failedActions)
                                            + "/" + completedActions + " asset(s)")
                    );
                    computeInjectStatus(injectStatus, finalExecutionTime);
                    // Update related inject
                    computeInject(injectStatus);
                }
            }
        }));
    }

    // -- EXPECTATION --

    private void computeExpectationForAsset(
            @NotNull final Inject inject,
            @NotBlank final String assetId,
            @NotNull final boolean fail, // Is action failed, success for expectation
            @NotBlank final String result) {
        InjectExpectation expectation = this.injectExpectationService
                .preventionExpectationForAsset(inject, assetId);
        if (expectation != null) {
            // Not already handle
            List<InjectExpectationResult> results = resultsBySourceId(expectation, this.calderaInjectorConfig.getId());
            if (results.isEmpty()) {
                this.injectExpectationService.computeExpectation(
                        expectation,
                        this.calderaInjectorConfig.getId(),
                        CalderaInjectorConfig.PRODUCT_NAME,
                        result,
                        fail);
            }
        }
    }

    // -- INJECT STATUS --

    @Transactional
    public void computeInjectStatus(
            @NotNull final InjectStatus injectStatus,
            @NotNull final Instant finalExecutionTime) {
        boolean hasError = injectStatus.getTraces().stream().anyMatch(trace -> trace.getStatus().equals(ExecutionStatus.ERROR));
        injectStatus.setName(hasError ? ExecutionStatus.ERROR : ExecutionStatus.SUCCESS);
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
