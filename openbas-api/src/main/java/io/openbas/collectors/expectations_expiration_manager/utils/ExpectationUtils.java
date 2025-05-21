package io.openbas.collectors.expectations_expiration_manager.utils;

import static io.openbas.database.model.InjectExpectation.EXPECTATION_TYPE.DETECTION;
import static io.openbas.database.model.InjectExpectation.EXPECTATION_TYPE.PREVENTION;

import io.openbas.database.model.InjectExpectation;
import io.openbas.database.model.InjectExpectation.EXPECTATION_TYPE;
import io.openbas.expectation.ExpectationType;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

public class ExpectationUtils {

  public static final String PREVENTED = "Prevented";

  private ExpectationUtils() {}

  public static boolean isExpired(@NotNull final InjectExpectation expectation) {
    Instant expirationTime =
        Instant.now().minus(expectation.getExpirationTime() / 60, ChronoUnit.MINUTES);
    return expectation.getCreatedAt().isBefore(expirationTime);
  }

  public static String computeSuccessMessage(@NotNull final EXPECTATION_TYPE expectationType) {
    return DETECTION.equals(expectationType)
        ? ExpectationType.DETECTION.successLabel
        : PREVENTION.equals(expectationType)
            ? PREVENTED
            : ExpectationType.HUMAN_RESPONSE.successLabel;
  }

  public static String computeFailedMessage(@NotNull final EXPECTATION_TYPE expectationType) {
    return DETECTION.equals(expectationType)
        ? ExpectationType.DETECTION.failureLabel
        : PREVENTION.equals(expectationType)
            ? ExpectationType.PREVENTION.failureLabel
            : ExpectationType.HUMAN_RESPONSE.failureLabel;
  }
}
