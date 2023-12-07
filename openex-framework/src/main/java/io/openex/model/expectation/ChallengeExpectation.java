package io.openex.model.expectation;

import io.openex.database.model.Challenge;
import io.openex.database.model.InjectExpectation;
import io.openex.model.Expectation;
import lombok.Getter;
import lombok.Setter;

import java.util.Objects;

@Getter
@Setter
public class ChallengeExpectation implements Expectation {

  private Integer score;
  private Challenge challenge;

  public ChallengeExpectation(Integer score, Challenge challenge) {
    setScore(Objects.requireNonNullElse(score, 100));
    setChallenge(challenge);
  }

  @Override
  public InjectExpectation.EXPECTATION_TYPE type() {
    return InjectExpectation.EXPECTATION_TYPE.CHALLENGE;
  }

}
