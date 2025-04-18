package io.openbas.utils.challenge;

import io.openbas.rest.exercise.form.ExpectationUpdateInput;

public class ChallengeExpectationUtils {

  private ChallengeExpectationUtils() {}

  public static ExpectationUpdateInput buildChallengeUpdateInput(Double score) {
    ExpectationUpdateInput expectationUpdateInput = new ExpectationUpdateInput();
    expectationUpdateInput.setSourceId("challenge");
    expectationUpdateInput.setSourceType("challenge");
    expectationUpdateInput.setSourceName("Challenge validation");
    expectationUpdateInput.setScore(score);
    return expectationUpdateInput;
  }
}
