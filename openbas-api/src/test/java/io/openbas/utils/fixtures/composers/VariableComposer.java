package io.openbas.utils.fixtures.composers;

import io.openbas.database.model.Variable;
import io.openbas.database.repository.VariableRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class VariableComposer extends ComposerBase<Variable> {
  @Autowired private VariableRepository variableRepository;

  public class Composer extends InnerComposerBase<Variable> {
    private final Variable variable;

    public Composer(Variable variable) {
      this.variable = variable;
    }

    @Override
    public Composer persist() {
      variableRepository.save(variable);
      return this;
    }

    @Override
    public Variable get() {
      return this.variable;
    }
  }

  public Composer forVariable(Variable variable) {
    generatedItems.add(variable);
    return new Composer(variable);
  }
}
