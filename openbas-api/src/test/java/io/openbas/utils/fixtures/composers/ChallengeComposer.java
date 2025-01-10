package io.openbas.utils.fixtures.composers;

import io.openbas.database.model.Challenge;
import io.openbas.database.model.Tag;
import io.openbas.database.repository.ChallengeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Component
public class ChallengeComposer {
  @Autowired private ChallengeRepository challengeRepository;

  public class Composer extends InnerComposerBase<Challenge> {
    private final Challenge challenge;
    private final List<TagComposer.Composer> tagComposers = new ArrayList<>();

    public Composer(Challenge challenge) {
      this.challenge = challenge;
    }

    public Composer withTag(TagComposer.Composer tagComposer) {
      tagComposers.add(tagComposer);
      this.tagComposers.add(tagComposer);
      Set<Tag> tempTags = this.challenge.getTags();
      tempTags.add(tagComposer.get());
      this.challenge.setTags(tempTags);
      return this;
    }

    @Override
    public Composer persist() {
      this.tagComposers.forEach(TagComposer.Composer::persist);
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