package io.openbas.utils.fixtures.composers;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.database.model.Inject;
import io.openbas.database.model.InjectorContract;
import io.openbas.database.repository.InjectRepository;
import io.openbas.database.repository.InjectorContractRepository;
import io.openbas.injectors.challenge.ChallengeContract;
import io.openbas.injectors.challenge.model.ChallengeContent;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

// TODO: injector contract, payloads...
@Component
public class InjectComposer {
  @Autowired private InjectRepository injectRepository;
  @Autowired private InjectorContractRepository injectorContractRepository;
  @Autowired private ObjectMapper objectMapper;

  public class Composer extends InnerComposerBase<Inject> {
    private final Inject inject;
    private final List<ChallengeComposer.Composer> challengeComposers = new ArrayList<>();

    public Composer(Inject inject) {
      this.inject = inject;
    }

    // note this sets the inject's injector contract to Challenge Publish
    public Composer withChallenge(ChallengeComposer.Composer challengeComposer) {
      challengeComposers.add(challengeComposer);
      InjectorContract injectorContract = injectorContractRepository.findById(ChallengeContract.CHALLENGE_PUBLISH).orElseThrow();
      this.inject.setInjectorContract(injectorContract);
      return this;
    }

    @Override
    public Composer persist() {
      challengeComposers.forEach(ChallengeComposer.Composer::persist);
      // replace the inject content if applicable, after persisting the challenges
      ChallengeContent cc = new ChallengeContent();
      cc.setChallenges(
          challengeComposers.stream().map(composer -> composer.get().getId()).toList());
      this.inject.setContent(objectMapper.valueToTree(cc));
      injectRepository.save(inject);
      return this;
    }

    @Override
    public Inject get() {
      return this.inject;
    }
  }

  public Composer forInject(Inject inject) {
    return new Composer(inject);
  }
}
