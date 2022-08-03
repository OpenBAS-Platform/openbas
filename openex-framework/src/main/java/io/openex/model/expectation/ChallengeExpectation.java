package io.openex.model.expectation;

import io.openex.database.model.Article;
import io.openex.database.model.Challenge;
import io.openex.database.model.InjectExpectation;
import io.openex.model.Expectation;

import java.util.Objects;

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

    @Override
    public Integer score() {
        return score;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public Challenge getChallenge() {
        return challenge;
    }

    public void setChallenge(Challenge challenge) {
        this.challenge = challenge;
    }
}
