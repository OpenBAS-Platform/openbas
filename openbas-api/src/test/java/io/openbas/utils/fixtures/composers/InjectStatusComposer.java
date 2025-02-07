package io.openbas.utils.fixtures.composers;

import io.openbas.database.model.InjectStatus;
import io.openbas.database.repository.InjectStatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class InjectStatusComposer extends ComposerBase<InjectStatus> {
  @Autowired private InjectStatusRepository injectStatusRepository;

  public class Composer extends InnerComposerBase<InjectStatus> {
    private final InjectStatus injectStatus;

    public Composer(InjectStatus injectStatus) {
      this.injectStatus = injectStatus;
    }

    @Override
    public InjectStatusComposer.Composer persist() {
      injectStatusRepository.save(injectStatus);
      return this;
    }

    @Override
    public InjectStatusComposer.Composer delete() {
      injectStatusRepository.delete(injectStatus);
      return this;
    }

    @Override
    public InjectStatus get() {
      return this.injectStatus;
    }
  }

  public InjectStatusComposer.Composer forInjectStatus(InjectStatus injectStatus) {
    generatedItems.add(injectStatus);
    return new InjectStatusComposer.Composer(injectStatus);
  }
}
