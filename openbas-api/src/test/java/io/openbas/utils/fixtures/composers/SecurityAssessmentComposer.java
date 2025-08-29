package io.openbas.utils.fixtures.composers;

import io.openbas.database.model.SecurityAssessment;
import io.openbas.database.repository.SecurityAssessmentRepository;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class SecurityAssessmentComposer extends ComposerBase<SecurityAssessment> {
  @Autowired private SecurityAssessmentRepository securityAssessmentRepository;

  public class Composer extends InnerComposerBase<SecurityAssessment> {
    private final SecurityAssessment securityAssessment;
    private Optional<ScenarioComposer.Composer> scenarioComposer = Optional.empty();

    public Composer(SecurityAssessment securityAssessment) {
      this.securityAssessment = securityAssessment;
    }

    public Composer withScenario(ScenarioComposer.Composer scenarioWrapper) {
      scenarioComposer = Optional.of(scenarioWrapper);
      this.securityAssessment.setScenario(scenarioWrapper.get());
      return this;
    }

    @Override
    public Composer persist() {
      scenarioComposer.ifPresent(ScenarioComposer.Composer::persist);
      securityAssessmentRepository.save(this.securityAssessment);
      return this;
    }

    @Override
    public Composer delete() {
      scenarioComposer.ifPresent(ScenarioComposer.Composer::delete);
      securityAssessmentRepository.delete(this.securityAssessment);
      return this;
    }

    @Override
    public SecurityAssessment get() {
      return this.securityAssessment;
    }
  }

  public Composer forSecurityAssessment(SecurityAssessment securityAssessment) {
    generatedItems.add(securityAssessment);
    return new Composer(securityAssessment);
  }
}
