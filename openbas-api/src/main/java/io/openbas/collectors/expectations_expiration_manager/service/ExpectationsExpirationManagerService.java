package io.openbas.collectors.expectations_expiration_manager.service;

import static io.openbas.collectors.expectations_expiration_manager.utils.ExpectationUtils.computeFailedMessage;
import static io.openbas.collectors.expectations_expiration_manager.utils.ExpectationUtils.isExpired;
import static io.openbas.utils.inject_expectation_result.InjectExpectationResultUtils.expireEmptyResults;
import static io.openbas.utils.inject_expectation_result.InjectExpectationResultUtils.hasValidResults;

import io.openbas.collectors.expectations_expiration_manager.config.ExpectationsExpirationManagerConfig;
import io.openbas.database.model.Collector;
import io.openbas.database.model.InjectExpectation;
import io.openbas.rest.collector.service.CollectorService;
import io.openbas.rest.inject.form.InjectExpectationUpdateInput;
import io.openbas.service.InjectExpectationService;
import io.openbas.utils.ExpectationUtils;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
@Slf4j
public class ExpectationsExpirationManagerService {

  private final InjectExpectationService injectExpectationService;
  private final ExpectationsExpirationManagerConfig config;
  private final CollectorService collectorService;

  @Transactional(rollbackFor = Exception.class)
  public void computeExpectations() {
    Collector collector = this.collectorService.collector(config.getId());
    List<InjectExpectation> expectations = this.injectExpectationService.expectationsNotFill();

    if (expectations.isEmpty()) {
      return;
    }

    List<InjectExpectation> updated = new ArrayList<>();
    this.processAgentExpectations(expectations, collector, updated);
    this.processAssetExpectations(expectations, collector, updated);
    this.processAssetGroupExpectations(expectations, collector, updated);
    this.processRemainingExpectations(expectations, collector, updated);

    if (updated.isEmpty()) {
      return;
    }
    this.injectExpectationService.updateAll(updated);
  }

  // -- PRIVATE --
  private void processAgentExpectations(
      @NotNull final List<InjectExpectation> expectations,
      @NotNull final Collector collector,
      @NotNull final List<InjectExpectation> updated) {
    List<InjectExpectation> expectationAgents =
        expectations.stream().filter(ExpectationUtils::isAgentExpectation).toList();
    expectationAgents.forEach(
        expectation -> {
          if (isExpired(expectation)) {
            InjectExpectationUpdateInput input = new InjectExpectationUpdateInput();
            input.setIsSuccess(false);
            input.setResult(computeFailedMessage(expectation.getType()));
            expireEmptyResults(expectation.getResults());
            updated.add(
                this.injectExpectationService.computeExpectationAgent(
                    expectation, input, collector));
          }
        });
  }

  private void processAssetExpectations(
      @NotNull final List<InjectExpectation> expectations,
      @NotNull final Collector collector,
      @NotNull final List<InjectExpectation> updated) {
    List<InjectExpectation> expectationAssets =
        expectations.stream().filter(ExpectationUtils::isAssetExpectation).toList();
    expectationAssets.forEach(
        (expectationAsset -> {
          List<InjectExpectation> expectationAgents =
              this.injectExpectationService.expectationsForAgents(
                  expectationAsset.getInject(),
                  expectationAsset.getAsset(),
                  expectationAsset.getAssetGroup(),
                  expectationAsset.getType());
          // Every agent expectation is filled
          if (expectationAgents.stream().allMatch(e -> hasValidResults(e.getResults()))) {
            expireEmptyResults(expectationAsset.getResults());
            updated.add(
                this.injectExpectationService.computeExpectationAsset(
                    expectationAsset, expectationAgents, collector));
          }
        }));
  }

  private void processAssetGroupExpectations(
      @NotNull final List<InjectExpectation> expectations,
      @NotNull final Collector collector,
      @NotNull final List<InjectExpectation> updated) {
    List<InjectExpectation> expectationAssetGroups =
        expectations.stream().filter(ExpectationUtils::isAssetGroupExpectation).toList();
    expectationAssetGroups.forEach(
        (expectationAssetGroup -> {
          List<InjectExpectation> expectationAssets =
              this.injectExpectationService.expectationsForAssets(
                  expectationAssetGroup.getInject(),
                  expectationAssetGroup.getAssetGroup(),
                  expectationAssetGroup.getType());
          // Every asset expectation is filled
          if (expectationAssets.stream().allMatch(e -> hasValidResults(e.getResults()))) {
            expireEmptyResults(expectationAssetGroup.getResults());
            updated.add(
                this.injectExpectationService.computeExpectationAssetGroup(
                    expectationAssetGroup, expectationAssets, collector));
          }
        }));
  }

  private void processRemainingExpectations(
      @NotNull final List<InjectExpectation> expectations,
      @NotNull final Collector collector,
      @NotNull final List<InjectExpectation> updated) {
    List<InjectExpectation> remainingExpectations =
        expectations.stream().filter(exp -> exp.getScore() == null).toList();
    remainingExpectations.forEach(
        expectation -> {
          if (isExpired(expectation)) {
            InjectExpectationUpdateInput input = new InjectExpectationUpdateInput();
            input.setIsSuccess(false);
            input.setResult(computeFailedMessage(expectation.getType()));
            expireEmptyResults(expectation.getResults());
            updated.add(
                injectExpectationService.computeExpectationAgent(expectation, input, collector));
          }
        });
  }
}
