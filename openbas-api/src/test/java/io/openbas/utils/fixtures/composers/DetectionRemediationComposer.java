package io.openbas.utils.fixtures.composers;

import io.openbas.database.model.DetectionRemediation;
import io.openbas.database.repository.DetectionRemediationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class DetectionRemediationComposer extends ComposerBase<DetectionRemediation> {

  @Autowired private DetectionRemediationRepository detectionRemediationRepository;

  public class Composer extends InnerComposerBase<DetectionRemediation> {

    private final DetectionRemediation detectionRemediation;

    public Composer(DetectionRemediation detectionRemediation) {
      this.detectionRemediation = detectionRemediation;
    }

    public Composer withCollector(CollectorComposer.Composer newCollector) {
      detectionRemediation.setCollector(newCollector.get());
      return this;
    }

    @Override
    public DetectionRemediationComposer.Composer persist() {
      detectionRemediationRepository.save(this.detectionRemediation);
      return this;
    }

    @Override
    public DetectionRemediationComposer.Composer delete() {
      detectionRemediationRepository.delete(this.detectionRemediation);
      return this;
    }

    @Override
    public DetectionRemediation get() {
      return this.detectionRemediation;
    }
  }

  public DetectionRemediationComposer.Composer forDetectionRemediation(
      DetectionRemediation detectionRemediation) {
    generatedItems.add(detectionRemediation);
    return new DetectionRemediationComposer.Composer(detectionRemediation);
  }
}
