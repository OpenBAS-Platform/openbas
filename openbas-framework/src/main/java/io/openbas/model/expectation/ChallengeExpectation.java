package io.openbas.model.expectation;

import io.openbas.database.model.Challenge;
import io.openbas.database.model.InjectExpectation;
import io.openbas.model.Expectation;
import lombok.Getter;
import lombok.Setter;

import java.util.Objects;

@Getter
@Setter
public class ChallengeExpectation implements Expectation {

  private Double score;
  private Challenge challenge;
  private boolean expectationGroup;

  public ChallengeExpectation(Double score, Challenge challenge) {
    setScore(Objects.requireNonNullElse(score, 100.0));
    setChallenge(challenge);
  }

  public ChallengeExpectation(Double score, Challenge challenge, boolean expectationGroup) {
    setScore(Objects.requireNonNullElse(score, 100.0));
    setChallenge(challenge);
    setExpectationGroup(expectationGroup);
  }

  @Override
  public InjectExpectation.EXPECTATION_TYPE type() {
    return InjectExpectation.EXPECTATION_TYPE.CHALLENGE;
  }

}
