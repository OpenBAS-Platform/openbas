package io.openbas.collectors.expectations_expiration_manager.utils;

import static io.openbas.database.model.InjectExpectation.EXPECTATION_TYPE.DETECTION;
import static io.openbas.database.model.InjectExpectation.EXPECTATION_TYPE.PREVENTION;

import io.openbas.database.model.InjectExpectation;
import io.openbas.database.model.InjectExpectation.EXPECTATION_TYPE;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

public class ExpectationUtils {

  public static final String FAILED = "FAILED";
  public static final String PREVENTED = "Prevented";
  public static final String DETECTED = "Detected";
  public static final String NOT_DETECTED = "Not Detected";
  public static final String NOT_PREVENTED = "Not Prevented";

  private ExpectationUtils() {}

  public static boolean isExpired(@NotNull final InjectExpectation expectation) {
    Instant expirationTime =
        Instant.now().minus(expectation.getExpirationTime() / 60, ChronoUnit.MINUTES);
    return expectation.getCreatedAt().isBefore(expirationTime);
  }

  public static String computeSuccessMessage(@NotNull final EXPECTATION_TYPE expectationType) {
    return DETECTION.equals(expectationType)
        ? DETECTED
        : PREVENTION.equals(expectationType) ? PREVENTED : FAILED;
  }

  public static String computeFailedMessage(@NotNull final EXPECTATION_TYPE expectationType) {
    return DETECTION.equals(expectationType)
        ? NOT_DETECTED
        : PREVENTION.equals(expectationType) ? NOT_PREVENTED : FAILED;
  }
}
