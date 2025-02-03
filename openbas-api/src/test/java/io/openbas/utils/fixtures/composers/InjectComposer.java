package io.openbas.utils.fixtures.composers;

import io.openbas.database.model.Inject;
import io.openbas.database.model.Tag;
import io.openbas.database.repository.InjectRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class InjectComposer extends ComposerBase<Inject> {
  @Autowired private InjectRepository injectRepository;

  public class Composer extends InnerComposerBase<Inject> {
    private final Inject inject;
    private Optional<InjectorContractComposer.Composer> injectorContractComposer = Optional.empty();
    private final List<TagComposer.Composer> tagComposers = new ArrayList<>();

    public Composer(Inject inject) {
      this.inject = inject;
    }

    public Composer withTag(TagComposer.Composer tagComposer) {
      tagComposers.add(tagComposer);
      Set<Tag> tempTags = this.inject.getTags();
      tempTags.add(tagComposer.get());
      this.inject.setTags(tempTags);
      return this;
    }

    public Composer withInjectorContract(
        InjectorContractComposer.Composer injectorContractComposer) {
      this.injectorContractComposer = Optional.of(injectorContractComposer);
      this.inject.setInjectorContract(injectorContractComposer.get());
      return this;
    }

    public Composer withId(String id) {
      this.inject.setId(id);
      return this;
    }

    @Override
    public Composer persist() {
      tagComposers.forEach(TagComposer.Composer::persist);
      this.injectorContractComposer.ifPresent(
          composer -> {
            composer.persist();
            this.inject.setContent(composer.getInjectContent());
          });
      injectRepository.save(inject);
      return this;
    }

    @Override
    public Composer delete() {
      injectRepository.delete(inject);
      tagComposers.forEach(TagComposer.Composer::delete);
      injectorContractComposer.ifPresent(InjectorContractComposer.Composer::delete);
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
