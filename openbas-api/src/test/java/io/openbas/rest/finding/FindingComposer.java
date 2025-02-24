package io.openbas.rest.finding;

import io.openbas.database.model.Finding;
import io.openbas.database.repository.FindingRepository;
import io.openbas.utils.fixtures.composers.ComposerBase;
import io.openbas.utils.fixtures.composers.InjectComposer;
import io.openbas.utils.fixtures.composers.InnerComposerBase;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class FindingComposer extends ComposerBase<Finding> {

  @Autowired
  private FindingRepository findingRepository;

  public class Composer extends InnerComposerBase<Finding> {

    private final Finding finding;
    private Optional<InjectComposer.Composer> injectComposer = Optional.empty();

    public Composer(Finding finding) {
      this.finding = finding;
    }

    public Composer withInject(InjectComposer.Composer injectComposer) {
      this.injectComposer = Optional.of(injectComposer);
      this.finding.setInject(injectComposer.get());
      return this;
    }

    @Override
    public FindingComposer.Composer persist() {
      injectComposer.ifPresent(InjectComposer.Composer::persist);
      findingRepository.save(this.finding);
      return this;
    }

    @Override
    public FindingComposer.Composer delete() {
      injectComposer.ifPresent(InjectComposer.Composer::delete);
      findingRepository.delete(this.finding);
      return this;
    }

    @Override
    public Finding get() {
      return this.finding;
    }
  }

  public FindingComposer.Composer forFinding(Finding finding) {
    generatedItems.add(finding);
    return new FindingComposer.Composer(finding);
  }
}
