package io.openbas.utils.fixtures;

import static io.openbas.database.model.ChallengeFlag.FLAG_TYPE.VALUE;

import io.openbas.database.model.Challenge;
import io.openbas.database.model.ChallengeFlag;
import java.util.List;

public class ChallengeFixture {

  public static Challenge createDefaultChallenge() {
    Challenge challenge = new Challenge();
    challenge.setName("Default challenge");
    ChallengeFlag challengeFlag = createDefaultChallengeFlag();
    challenge.setFlags(List.of(challengeFlag));
    challengeFlag.setChallenge(challenge);
    return challenge;
  }

  public static ChallengeFlag createDefaultChallengeFlag() {
    ChallengeFlag challengeFlag = new ChallengeFlag();
    challengeFlag.setType(VALUE);
    challengeFlag.setValue("flag value");
    return challengeFlag;
  }
}
