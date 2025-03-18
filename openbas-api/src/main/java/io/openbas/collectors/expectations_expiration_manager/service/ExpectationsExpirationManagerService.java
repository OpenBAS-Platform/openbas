package io.openbas.collectors.expectations_expiration_manager.service;

import static io.openbas.collectors.expectations_expiration_manager.config.ExpectationsExpirationManagerConfig.PRODUCT_NAME;
import static io.openbas.collectors.expectations_expiration_manager.utils.ExpectationUtils.computeFailedMessage;
import static io.openbas.collectors.expectations_expiration_manager.utils.ExpectationUtils.isExpired;

import io.openbas.collectors.expectations_expiration_manager.config.ExpectationsExpirationManagerConfig;
import io.openbas.database.model.InjectExpectation;
import io.openbas.service.InjectExpectationService;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
@Log
public class ExpectationsExpirationManagerService {

  public static final String COLLECTOR = "collector";
  private final InjectExpectationService injectExpectationService;
  private final ExpectationsExpirationManagerConfig config;

  @Transactional(rollbackFor = Exception.class)
  public void computeExpectations() {
    List<InjectExpectation> expectations = this.injectExpectationService.expectationsNotFill();
    if (!expectations.isEmpty()) {
      this.computeExpectationsForAgents(expectations);
      this.computeExpectationsForAssets(expectations);
      this.computeExpectationsForAssetGroups(expectations);
      this.computeExpectations(expectations);
    }
  }

  // -- PRIVATE --
  private void computeExpectations(@NotNull final List<InjectExpectation> expectations) {
    List<InjectExpectation> remainingExpectations =
        expectations.stream().filter(exp -> exp.getScore() == null).toList();
    remainingExpectations.forEach(
        expectation -> {
          if (isExpired(expectation)) {
            String result = computeFailedMessage(expectation.getType());
            this.injectExpectationService.computeExpectation(
                expectation, this.config.getId(), COLLECTOR, PRODUCT_NAME, result, false, null);
          }
        });
  }

  private void computeExpectationsForAgents(@NotNull final List<InjectExpectation> expectations) {
    List<InjectExpectation> expectationAgents =
        expectations.stream().filter(e -> e.getAgent() != null).toList();
    expectationAgents.forEach(
        expectation -> {
          if (isExpired(expectation)) {
            String result = computeFailedMessage(expectation.getType());
            this.injectExpectationService.computeExpectation(
                expectation, this.config.getId(), COLLECTOR, PRODUCT_NAME, result, false, null);
          }
        });
  }

  private void computeExpectationsForAssets(@NotNull final List<InjectExpectation> expectations) {
    List<InjectExpectation> expectationAssets =
        expectations.stream().filter(e -> e.getAsset() != null && e.getAgent() == null).toList();
    expectationAssets.forEach(
        (expectationAsset -> {
          List<InjectExpectation> expectationAgents =
              this.injectExpectationService.expectationsForAgents(
                  expectationAsset.getInject(),
                  expectationAsset.getAsset(),
                  expectationAsset.getAssetGroup(),
                  expectationAsset.getType());
          // Every agent expectation is filled
          if (expectationAgents.stream().noneMatch(e -> e.getResults().isEmpty())) {
            this.injectExpectationService.computeExpectationAsset(
                expectationAsset, expectationAgents, this.config.getId(), COLLECTOR, PRODUCT_NAME);
          }
        }));
  }

  private void computeExpectationsForAssetGroups(
      @NotNull final List<InjectExpectation> expectations) {
    List<InjectExpectation> expectationAssetGroups =
        expectations.stream()
            .filter(e -> isAssetGroupExpectation(e))
            .toList();
    expectationAssetGroups.forEach(
        (expectationAssetGroup -> {
          List<InjectExpectation> expectationAssets =
              this.injectExpectationService.expectationsForAssets(
                  expectationAssetGroup.getInject(),
                  expectationAssetGroup.getAssetGroup(),
                  expectationAssetGroup.getType());
          // Every asset expectation is filled
          if (expectationAssets.stream().noneMatch(e -> e.getResults().isEmpty())) {
            this.injectExpectationService.computeExpectationGroup(
                expectationAssetGroup,
                expectationAssets,
                this.config.getId(),
                COLLECTOR,
                PRODUCT_NAME);
          }
        }));
  }

  private static boolean isAssetGroupExpectation(InjectExpectation e) {
    return e.getAssetGroup() != null && e.getAsset() == null && e.getAgent() == null;
  }
}
