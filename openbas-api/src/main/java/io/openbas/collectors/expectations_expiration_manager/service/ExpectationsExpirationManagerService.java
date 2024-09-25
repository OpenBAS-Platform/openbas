package io.openbas.collectors.expectations_expiration_manager.service;

import io.openbas.collectors.expectations_expiration_manager.config.ExpectationsExpirationManagerConfig;
import io.openbas.database.model.InjectExpectation;
import io.openbas.inject_expectation.InjectExpectationService;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static io.openbas.collectors.expectations_expiration_manager.config.ExpectationsExpirationManagerConfig.PRODUCT_NAME;
import static io.openbas.collectors.expectations_expiration_manager.utils.ExpectationUtils.computeFailedMessage;
import static io.openbas.collectors.expectations_expiration_manager.utils.ExpectationUtils.isExpired;

@RequiredArgsConstructor
@Service
@Log
public class ExpectationsExpirationManagerService {

  private final InjectExpectationService injectExpectationService;
  private final ExpectationsExpirationManagerConfig config;


  @Transactional(rollbackFor = Exception.class)
  public void computeExpectations() {
    List<InjectExpectation> expectations = this.injectExpectationService.expectationsNotFill();
    if (!expectations.isEmpty()) {
      this.computeExpectationsForAssets(expectations);
      this.computeExpectationsForAssetGroups(expectations);
      this.computeExpectations(expectations);
    }
  }

  // -- PRIVATE --

  private void computeExpectations(@NotNull final List<InjectExpectation> expectations) {
    List<InjectExpectation> expectationAssets = expectations.stream().toList();
    expectationAssets.forEach((expectation) -> {
      Long userExpirationTime = expectation.getExpirationTime();
      if (isExpired(expectation, Math.toIntExact(userExpirationTime / 60))) {
        String result = computeFailedMessage(expectation.getType());
        this.injectExpectationService.computeExpectation(
            expectation,
            this.config.getId(),
            "collector",
            PRODUCT_NAME,
            result,
            false
        );
      }

    });
  }

  private void computeExpectationsForAssets(@NotNull final List<InjectExpectation> expectations) {
    List<InjectExpectation> expectationAssets = expectations.stream().filter(e -> e.getAsset() != null).toList();
    expectationAssets.forEach((expectation) -> {
      Long userExpirationTime = expectation.getExpirationTime();
      if (isExpired(expectation, Math.toIntExact(userExpirationTime / 60))) {
        String result = computeFailedMessage(expectation.getType());
        this.injectExpectationService.computeExpectation(
            expectation,
            this.config.getId(),
            "collector",
            PRODUCT_NAME,
            result,
            false
        );
      }

    });
  }

  private void computeExpectationsForAssetGroups(@NotNull final List<InjectExpectation> expectations) {
    List<InjectExpectation> expectationAssetGroups = expectations.stream().filter(e -> e.getAssetGroup() != null)
        .toList();
    expectationAssetGroups.forEach((expectationAssetGroup -> {
      List<InjectExpectation> expectationAssets = this.injectExpectationService.expectationsForAssets(
          expectationAssetGroup.getInject(), expectationAssetGroup.getAssetGroup(), expectationAssetGroup.getType()
      );
      // Every expectation assets are filled
      if (expectationAssets.stream().noneMatch(e -> e.getResults().isEmpty())) {
        this.injectExpectationService.computeExpectationGroup(
            expectationAssetGroup,
            expectationAssets,
            this.config.getId(),
            "collector",
            PRODUCT_NAME
        );
      }
    }));
  }
}
