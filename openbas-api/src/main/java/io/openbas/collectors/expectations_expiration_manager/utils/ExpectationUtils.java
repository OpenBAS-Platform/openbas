package io.openbas.collectors.expectations_expiration_manager.utils;

import io.openbas.database.model.InjectExpectation;
import io.openbas.database.model.InjectExpectation.EXPECTATION_TYPE;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static io.openbas.database.model.InjectExpectation.EXPECTATION_TYPE.DETECTION;
import static io.openbas.database.model.InjectExpectation.EXPECTATION_TYPE.PREVENTION;

public class ExpectationUtils {

  public static boolean isExpired(@NotNull final InjectExpectation expectation, final int expirationTime) {
    return expectation.getCreatedAt().isBefore(Instant.now().minus(expirationTime, ChronoUnit.MINUTES));
  }

  public static String computeFailedMessage(@NotNull final EXPECTATION_TYPE expectationType) {
    return DETECTION.equals(expectationType)
        ? "Not detected"
        : PREVENTION.equals(expectationType)
            ? "Not prevented"
            : "Failed";
  }

}
