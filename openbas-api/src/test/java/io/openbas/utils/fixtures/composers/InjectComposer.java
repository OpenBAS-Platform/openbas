package io.openbas.utils.fixtures.composers;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.database.model.*;
import io.openbas.database.repository.InjectRepository;
import io.openbas.database.repository.InjectorContractRepository;
import io.openbas.injectors.challenge.ChallengeContract;
import io.openbas.injectors.challenge.model.ChallengeContent;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

// TODO: injector contract, payloads...
@Component
public class InjectComposer extends ComposerBase<Inject> {
  @Autowired private InjectRepository injectRepository;
  @Autowired private InjectorContractRepository injectorContractRepository;
  @Autowired private ObjectMapper objectMapper;

  public class Composer extends InnerComposerBase<Inject> {
    private final Inject inject;
    private final List<ChallengeComposer.Composer> challengeComposers = new ArrayList<>();
    private final List<TagComposer.Composer> tagComposers = new ArrayList<>();
    private final List<EndpointComposer.Composer> endpointComposers = new ArrayList<>();
    private InjectStatusComposer.Composer injectStatusComposers = null;

    public Composer(Inject inject) {
      this.inject = inject;
    }

    // note this sets the inject's injector contract to Challenge Publish
    public Composer withChallenge(ChallengeComposer.Composer challengeComposer) {
      challengeComposers.add(challengeComposer);
      InjectorContract injectorContract =
          injectorContractRepository.findById(ChallengeContract.CHALLENGE_PUBLISH).orElseThrow();
      this.inject.setInjectorContract(injectorContract);
      return this;
    }

    public Composer withTag(TagComposer.Composer tagComposer) {
      tagComposers.add(tagComposer);
      Set<Tag> tempTags = this.inject.getTags();
      tempTags.add(tagComposer.get());
      this.inject.setTags(tempTags);
      return this;
    }

    public Composer withId(String id) {
      this.inject.setId(id);
      return this;
    }

    public Composer withInjectStatus(InjectStatusComposer.Composer injectStatus) {
      injectStatusComposers = injectStatus;
      injectStatus.get().setInject(this.inject);
      this.inject.setStatus(injectStatus.get());
      return this;
    }

    public Composer withEndpoint(EndpointComposer.Composer endpointComposer) {
      endpointComposers.add(endpointComposer);
      List<Asset> assets = inject.getAssets();
      assets.add(endpointComposer.get());
      this.inject.setAssets(assets);
      return this;
    }

    @Override
    public Composer persist() {
      endpointComposers.forEach(EndpointComposer.Composer::persist);
      tagComposers.forEach(TagComposer.Composer::persist);
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
    public Composer delete() {
      injectRepository.delete(inject);
      challengeComposers.forEach(ChallengeComposer.Composer::delete);
      tagComposers.forEach(TagComposer.Composer::delete);
      endpointComposers.forEach(EndpointComposer.Composer::delete);
      if (injectStatusComposers != null) {
        injectStatusComposers.delete();
      }
      return this;
    }

    @Override
    public Inject get() {
      return this.inject;
    }
  }

  public Composer forInject(Inject inject) {
    generatedItems.add(inject);
    return new Composer(inject);
  }
}
