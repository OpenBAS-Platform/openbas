package io.openbas.service.targets.search;

import io.openbas.database.model.Inject;
import io.openbas.database.model.InjectExpectation;
import io.openbas.database.model.InjectTarget;
import io.openbas.service.InjectExpectationService;
import io.openbas.utils.AtomicTestingUtils;
import io.openbas.utils.mapper.InjectExpectationMapper;
import java.util.List;
import java.util.function.Supplier;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@RequiredArgsConstructor
@Component
public class HelperTargetSearchAdaptor {

  private final InjectExpectationService injectExpectationService;
  private final InjectExpectationMapper injectExpectationMapper;

  public InjectTarget buildTargetWithExpectations(
      Inject inject, Supplier<InjectTarget> targetSupplier, boolean allowVulnerability) {
    InjectTarget target = targetSupplier.get();

    List<InjectExpectation> mergedExpectationsByInjectAndTargetAndTargetType =
        injectExpectationService.findMergedExpectationsByInjectAndTargetAndTargetType(
            inject.getId(), target.getId(), target.getTargetType());

    List<AtomicTestingUtils.ExpectationResultsByType> results =
        injectExpectationMapper.extractExpectationResults(
            inject.getContent(),
            mergedExpectationsByInjectAndTargetAndTargetType,
            AtomicTestingUtils::getScores);

    for (AtomicTestingUtils.ExpectationResultsByType result : results) {
      switch (result.type()) {
        case DETECTION -> target.setTargetDetectionStatus(result.avgResult());
        case PREVENTION -> target.setTargetPreventionStatus(result.avgResult());
        case VULNERABILITY -> {
          if (allowVulnerability) {
            target.setTargetVulnerabilityStatus(result.avgResult());
          }
        }
        case HUMAN_RESPONSE -> target.setTargetHumanResponseStatus(result.avgResult());
      }
    }

    return target;
  }
}
