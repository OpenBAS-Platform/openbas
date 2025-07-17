package io.openbas.utils.fixtures.composers;

import io.openbas.database.model.AttackPattern;
import io.openbas.database.repository.AttackPatternRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class AttackPatternComposer extends ComposerBase<AttackPattern> {
  @Autowired private AttackPatternRepository attackPatternRepository;

  public class Composer extends InnerComposerBase<AttackPattern> {
    private final AttackPattern attackPattern;

    public Composer(AttackPattern attackPattern) {
      this.attackPattern = attackPattern;
    }

    public Composer withId(String id) {
      this.attackPattern.setId(id);
      return this;
    }

    @Override
    public AttackPatternComposer.Composer persist() {
      attackPatternRepository.save(attackPattern);
      return this;
    }

    @Override
    public AttackPatternComposer.Composer delete() {
      attackPatternRepository.delete(attackPattern);
      return this;
    }

    @Override
    public AttackPattern get() {
      return this.attackPattern;
    }
  }

  public AttackPatternComposer.Composer forAttackPattern(AttackPattern attackPattern) {
    Composer composer = new AttackPatternComposer.Composer(attackPattern);
    generatedItems.add(attackPattern);
    generatedComposer.add(composer);
    return composer;
  }
}
