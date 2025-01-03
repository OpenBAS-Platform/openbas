package io.openbas.utils.fixtures.composers;

import io.openbas.database.model.Challenge;
import io.openbas.database.repository.ChallengeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ChallengeComposer {
  @Autowired private ChallengeRepository challengeRepository;

  public class Composer extends InnerComposerBase<Challenge> {
    private final Challenge challenge;

    public Composer(Challenge challenge) {
      this.challenge = challenge;
    }

    @Override
    public Composer persist() {
      challengeRepository.save(challenge);
      return this;
    }

    @Override
    public Challenge get() {
      return this.challenge;
    }
  }

  public Composer forChallenge(Challenge challenge) {
    return new Composer(challenge);
  }
}
