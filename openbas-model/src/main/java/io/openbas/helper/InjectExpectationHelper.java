package io.openbas.helper;

import io.openbas.database.model.InjectExpectation;
import io.openbas.database.model.InjectExpectation.EXPECTATION_STATUS;
import io.openbas.database.model.InjectExpectationResult;
import java.util.List;
import org.jetbrains.annotations.NotNull;

public class InjectExpectationHelper {

  private InjectExpectationHelper() {}

  public static EXPECTATION_STATUS computeStatus(
      @NotNull final InjectExpectation injectExpectation) {
    if (injectExpectation.getScore() == null) {
      return EXPECTATION_STATUS.PENDING;
    }
    if (injectExpectation.getTeam() != null) {
      return computeStatusForTeam(injectExpectation.getResults());
    }

    if (injectExpectation.getScore() >= injectExpectation.getExpectedScore()) {
      return EXPECTATION_STATUS.SUCCESS;
    }
    if (0.0 == injectExpectation.getScore()) {
      return EXPECTATION_STATUS.FAILED;
    }
    return EXPECTATION_STATUS.PARTIAL;
  }

  public static EXPECTATION_STATUS computeStatusForTeam(
      @NotNull final List<InjectExpectationResult> results) {
    String result = results.getFirst().getResult().toUpperCase();
    return switch (result) {
      case "FAILED" -> EXPECTATION_STATUS.FAILED;
      case "SUCCESS" -> EXPECTATION_STATUS.SUCCESS;
      case "PARTIAL" -> EXPECTATION_STATUS.PARTIAL;
      case "UNKNOWN" -> EXPECTATION_STATUS.UNKNOWN;
      default -> EXPECTATION_STATUS.PENDING;
    };
  }
}
