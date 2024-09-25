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
  private String name;
  private Long expirationTime;

  public ChallengeExpectation(io.openbas.model.inject.form.Expectation expectation, Challenge challenge) {
    setScore(Objects.requireNonNullElse(expectation.getScore(), 100.0));
    setChallenge(challenge);
    setName(challenge.getName());
    setExpectationGroup(expectation.isExpectationGroup());
    setExpirationTime(expectation.getExpirationTime());
  }

  @Override
  public InjectExpectation.EXPECTATION_TYPE type() {
    return InjectExpectation.EXPECTATION_TYPE.CHALLENGE;
  }

}
