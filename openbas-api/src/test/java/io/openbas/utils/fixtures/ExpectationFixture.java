package io.openbas.utils.fixtures;

import io.openbas.database.model.*;
import io.openbas.model.expectation.DetectionExpectation;
import io.openbas.model.expectation.PreventionExpectation;
import io.openbas.rest.exercise.form.ExpectationUpdateInput;
import java.util.List;

public class ExpectationFixture {

  static Double SCORE = 100.0;

  public static PreventionExpectation createTechnicalPreventionExpectation(
      Agent agent,
      Asset asset,
      PreventionExpectation preventionExpectation,
      List<InjectExpectationSignature> signatures) {
    return PreventionExpectation.preventionExpectationForAgent(
        agent, asset, preventionExpectation, signatures);
  }

  public static DetectionExpectation createTechnicalDetectionExpectation(
      Agent agent,
      Asset asset,
      DetectionExpectation detectionExpectation,
      List<InjectExpectationSignature> signatures) {
    return DetectionExpectation.detectionExpectationForAgent(
        agent, asset, detectionExpectation, signatures);
  }

  public static PreventionExpectation createTechnicalPreventionExpectation(
      Asset asset, Long expirationTime) {
    return PreventionExpectation.preventionExpectationForAsset(
        SCORE, "Prevention", "Prevention Expectation", asset, false, expirationTime);
  }

  public static DetectionExpectation createTechnicalDetectionExpectation(
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
