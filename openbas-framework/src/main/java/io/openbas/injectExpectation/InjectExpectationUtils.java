package io.openbas.injectExpectation;

import io.openbas.database.model.InjectExpectation;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class InjectExpectationUtils {


  public static void computeExpectationGroup(
      @NotNull final InjectExpectation expectationAssetGroup,
      @NotNull final List<InjectExpectation> expectationAssets) {
    if (expectationAssetGroup.isExpectationGroup()) {
      boolean success = expectationAssets.stream().anyMatch((e) -> e.getExpectedScore().equals(e.getScore()));
      expectationAssetGroup.setResult(success ? "VALIDATED" : "FAILED");
      expectationAssetGroup.setScore(success ? expectationAssetGroup.getExpectedScore() : 0);
    } else {
      boolean success = expectationAssets.stream().allMatch((e) -> e.getExpectedScore().equals(e.getScore()));
      expectationAssetGroup.setResult(success ? "VALIDATED" : "FAILED");
      expectationAssetGroup.setScore(success ? expectationAssetGroup.getExpectedScore() : 0);
    }
  }
}
