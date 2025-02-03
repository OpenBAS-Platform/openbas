package io.openbas.utils.fixtures.composers;

import static io.openbas.injectors.challenge.ChallengeContract.CHALLENGE_PUBLISH;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.database.model.Injector;
import io.openbas.database.model.InjectorContract;
import io.openbas.database.repository.InjectorContractRepository;
import io.openbas.injectors.challenge.model.ChallengeContent;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class InjectorContractComposer extends ComposerBase<InjectorContract> {
  @Autowired private InjectorContractRepository injectorContractRepository;
  @Autowired private ObjectMapper objectMapper;

  public class Composer extends InnerComposerBase<InjectorContract> {
    private final List<String> WELL_KNOWN_CONTRACT_IDS = List.of(CHALLENGE_PUBLISH);

    private final InjectorContract injectorContract;
    private Optional<PayloadComposer.Composer> payloadComposer = Optional.empty();
    private final List<ChallengeComposer.Composer> challengeComposers = new ArrayList<>();

    public Composer(InjectorContract injectorContract) {
      this.injectorContract = injectorContract;
    }

    public Composer withPayload(PayloadComposer.Composer payloadComposer) {
      if (!this.challengeComposers.isEmpty()) {
        throw new IllegalStateException("Challenge composer already exists");
      }
      this.payloadComposer = Optional.of(payloadComposer);
      this.injectorContract.setPayload(payloadComposer.get());
      return this;
    }

    public Composer withChallenge(ChallengeComposer.Composer challengeComposer) {
      if (this.payloadComposer.isPresent()) {
        throw new IllegalStateException("Payload composer already exists");
      }
      // hack the wrapped object to match the well-known CHALLENGE_PUBLISH characteristics
      InjectorContract challengeInjectorContract =
          injectorContractRepository.findById(CHALLENGE_PUBLISH).orElseThrow();
      this.injectorContract.setId(challengeInjectorContract.getId());
      this.injectorContract.setContent(challengeInjectorContract.getContent());
      this.injectorContract.setConvertedContent(challengeInjectorContract.getConvertedContent());
      this.injectorContract.setInjector(challengeInjectorContract.getInjector());

      this.challengeComposers.add(challengeComposer);
      return this;
    }

    public Composer withInjector(Injector injector) {
      this.injectorContract.setInjector(injector);
      return this;
    }

    public ObjectNode getInjectContent() {
      if (payloadComposer.isPresent()) {
        return null;
      }

      if (!challengeComposers.isEmpty()) {
        // Challenges may not be persisted at this point, hence may not have IDs
        ChallengeContent cc = new ChallengeContent();
        cc.setChallenges(
            challengeComposers.stream().map(composer -> composer.get().getId()).toList());
        return objectMapper.valueToTree(cc);
      }

      return null;
    }

    @Override
    public Composer persist() {
      payloadComposer.ifPresent(PayloadComposer.Composer::persist);
      challengeComposers.forEach(ChallengeComposer.Composer::persist);
      if (!WELL_KNOWN_CONTRACT_IDS.contains(injectorContract.getId())) {
        injectorContractRepository.save(injectorContract);
      }
      return this;
    }

    @Override
    public Composer delete() {
      payloadComposer.ifPresent(PayloadComposer.Composer::delete);
      challengeComposers.forEach(ChallengeComposer.Composer::delete);
      if (!WELL_KNOWN_CONTRACT_IDS.contains(injectorContract.getId())) {
        injectorContractRepository.delete(injectorContract);
      }
      return this;
    }

    @Override
    public InjectorContract get() {
      return this.injectorContract;
    }
  }

  public Composer forInjectorContract(InjectorContract injectorContract) {
    this.generatedItems.add(injectorContract);
    return new Composer(injectorContract);
  }
}
