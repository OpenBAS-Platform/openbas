package io.openbas.utils.fixtures;

import io.openbas.database.model.*;
import io.openbas.model.expectation.DetectionExpectation;
import io.openbas.model.expectation.PreventionExpectation;
import io.openbas.rest.exercise.form.ExpectationUpdateInput;
import java.util.List;

public class ExpectationFixture {

  static Double SCORE = 100.0;

  public static PreventionExpectation createTechnicalPreventionExpectation(
      Agent agent, Asset asset, Long expirationTime, List<InjectExpectationSignature> signatures) {
    return PreventionExpectation.preventionExpectationForAgent(
        SCORE, "Prevention", "Prevention Expectation", agent, asset, expirationTime, signatures);
  }

  public static DetectionExpectation createTechnicalDetectionExpectation(
      Agent agent, Asset asset, Long expirationTime, List<InjectExpectationSignature> signatures) {
    return DetectionExpectation.detectionExpectationForAgent(
        SCORE, "Detection", "Detection Expectation", agent, asset, expirationTime, signatures);
  }

  public static PreventionExpectation createTechnicalPreventionExpectationForAsset(
      Asset asset, Long expirationTime) {
    return PreventionExpectation.preventionExpectationForAsset(
        SCORE, "Prevention", "Prevention Expectation", asset, false, expirationTime);
  }

  public static DetectionExpectation createTechnicalDetectionExpectationForAsset(
      Asset asset, Long expirationTime) {
    return DetectionExpectation.detectionExpectationForAsset(
        SCORE, "Detection", "Detection Expectation", asset, false, expirationTime);
  }

  public static PreventionExpectation createPreventionExpectationForAssetGroup(
      AssetGroup assetGroup, Long expirationTime) {
    return PreventionExpectation.preventionExpectationForAssetGroup(
        SCORE, "Prevention", "Prevention Expectation", assetGroup, false, expirationTime);
  }

  public static DetectionExpectation createDetectionExpectationForAssetGroup(
      AssetGroup assetGroup, Long expirationTime) {
    return DetectionExpectation.detectionExpectationForAssetGroup(
        SCORE, "Detection", "Detection Expectation", assetGroup, false, expirationTime);
  }

  public static ExpectationUpdateInput getExpectationUpdateInput(String sourceId, Double score) {
    return ExpectationUpdateInput.builder()
        .sourceId(sourceId)
        .sourceName("security-platform-name")
        .sourceType("security-platform-type")
        .score(score)
        .build();
  }
}
