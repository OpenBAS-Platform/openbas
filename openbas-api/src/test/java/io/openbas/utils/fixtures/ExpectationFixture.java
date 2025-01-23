package io.openbas.utils.fixtures;

import io.openbas.database.model.Asset;
import io.openbas.model.expectation.DetectionExpectation;
import io.openbas.model.expectation.PreventionExpectation;
import java.util.Collections;

public class ExpectationFixture {

  static Long EXPIRATION_TIME_SIX_HOURS = 21600L;

  static Double SCORE = 100.0;

  public static PreventionExpectation createTechnicalPreventionExpectation(Asset asset) {
    return PreventionExpectation.preventionExpectationForAsset(
        SCORE,
        "Prevention",
        "Prevention Expectation",
        asset,
        false,
        EXPIRATION_TIME_SIX_HOURS,
        Collections.emptyList());
  }

  public static DetectionExpectation createTechnicalDetectionExpectation(Asset asset) {
    return DetectionExpectation.detectionExpectationForAsset(
        SCORE,
        "Detection",
        "Detection Expectation",
        asset,
        false,
        EXPIRATION_TIME_SIX_HOURS,
        Collections.emptyList());
  }
}
