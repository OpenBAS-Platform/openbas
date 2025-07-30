package io.openbas.utils.fixtures;

import io.openbas.database.model.*;
import io.openbas.model.expectation.DetectionExpectation;
import io.openbas.model.expectation.PreventionExpectation;
import io.openbas.model.inject.form.Expectation;
import io.openbas.rest.exercise.form.ExpectationUpdateInput;
import java.time.Instant;
import java.util.List;

public class ExpectationFixture {

  static Double SCORE = 100.0;

  public static Expectation createExpectation(InjectExpectation.EXPECTATION_TYPE expectationType) {
    Expectation expectation = new Expectation();
    expectation.setExpectationGroup(false);
    expectation.setName("Expectation 1");
    expectation.setDescription("Expectation 1");
    expectation.setType(expectationType);
    expectation.setScore(10D);
    expectation.setExpirationTime(Instant.now().toEpochMilli());
    return expectation;
  }

  public static PreventionExpectation createTechnicalPreventionExpectation(
      Agent agent,
      Asset asset,
      AssetGroup assetGroup,
      Long expirationTime,
      List<InjectExpectationSignature> signatures) {
    return PreventionExpectation.preventionExpectationForAgent(
        SCORE,
        "Prevention",
        "Prevention Expectation",
        agent,
        asset,
        assetGroup,
        expirationTime,
        signatures);
  }

  public static DetectionExpectation createTechnicalDetectionExpectation(
      Agent agent,
      Asset asset,
      AssetGroup assetGroup,
      Long expirationTime,
      List<InjectExpectationSignature> signatures) {
    return DetectionExpectation.detectionExpectationForAgent(
        SCORE,
        "Detection",
        "Detection Expectation",
        agent,
        asset,
        assetGroup,
        expirationTime,
        signatures);
  }

  public static PreventionExpectation createTechnicalPreventionExpectationForAsset(
      Asset asset, AssetGroup assetGroup, Long expirationTime) {
    return PreventionExpectation.preventionExpectationForAsset(
        SCORE, "Prevention", "Prevention Expectation", asset, assetGroup, expirationTime);
  }

  public static DetectionExpectation createTechnicalDetectionExpectationForAsset(
      Asset asset, AssetGroup assetGroup, Long expirationTime) {
    return DetectionExpectation.detectionExpectationForAsset(
        SCORE, "Detection", "Detection Expectation", asset, assetGroup, expirationTime);
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

  public static Expectation createExpectation() {
    Expectation expectation = new Expectation();
    expectation.setScore(SCORE);
    expectation.setName("Expectation Name");
    expectation.setDescription("Expectation Description");
    expectation.setExpirationTime(60L);
    return expectation;
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
