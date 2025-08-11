package io.openbas.service;

import io.openbas.database.model.AttackPattern;
import io.openbas.database.model.Exercise;
import io.openbas.database.model.Inject;
import io.openbas.database.model.StixRefToExternalRef;
import io.openbas.rest.attack_pattern.service.AttackPatternService;
import io.openbas.stix.objects.ObjectBase;
import io.openbas.stix.types.BaseType;
import io.openbas.stix.types.Identifier;
import io.openbas.stix.types.StixString;
import io.openbas.stix.types.Timestamp;
import io.openbas.utils.InjectExpectationResultUtils;
import io.openbas.utils.ResultUtils;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SimulationStixService {
  private final AttackPatternService attackPatternService;
  private final ResultUtils resultUtils;

  public List<ObjectBase> getCoverageForSimulation(Exercise exercise) {
    List<ObjectBase> objects = new ArrayList<>();

    for (StixRefToExternalRef stixRef : exercise.getSecurityAssessment().getAttackPatternRefs()) {
      ObjectBase result = new ObjectBase();
      Map<String, BaseType<?>> properties = new HashMap<>();
      result.setProperties(properties);

      // standard properties
      properties.put(
          "id", new Identifier("security-coverage--" + exercise.getPersistentSecurityCoverageId()));
      properties.put("created", new Timestamp(exercise.getCreatedAt()));
      properties.put("modified", new Timestamp(Instant.now()));
      properties.put(
          "security_assessment_ref", new Identifier(exercise.getSecurityAssessment().getId()));
      properties.put("coverage_context_ref", new Identifier(stixRef.getStixRef()));

      properties.put("coverage", getAttackPatternCoverage(stixRef.getExternalRef(), exercise));

      if (properties.containsKey("coverage")
          && properties.get("coverage") != null
          && !((Map<String, BaseType<?>>) properties.get("coverage").getValue()).isEmpty()) {
        properties.put("covered", new io.openbas.stix.types.Boolean(true));
      } else {
        properties.put("covered", new io.openbas.stix.types.Boolean(false));
      }

      objects.add(result);
    }

    return objects;
  }

  private BaseType<?> getAttackPatternCoverage(String externalRef, Exercise exercise) {
    List<AttackPattern> apList =
        attackPatternService.getAttackPatternsByExternalIdsThrowIfMissing(Set.of(externalRef));
    Optional<AttackPattern> ap = apList.stream().findFirst();
    if (ap.isEmpty()) {
      return uncovered();
    }

    // get all injects involved in attack pattern
    Set<Inject> injects =
        exercise.getInjects().stream()
            .filter(
                i ->
                    i.getInjectorContract().isPresent()
                        && i.getInjectorContract().get().getAttackPatterns().contains(ap.get()))
            .collect(Collectors.toSet());
    if (injects.isEmpty()) {
      return uncovered();
    }

    List<InjectExpectationResultUtils.ExpectationResultsByType> coverageResults =
        resultUtils.getResultsByTypes(
            injects.stream().map(Inject::getId).collect(Collectors.toSet()));

    Map<String, BaseType<?>> coverageValues = new HashMap<>();
    for (InjectExpectationResultUtils.ExpectationResultsByType result : coverageResults) {
      coverageValues.put(
          result.type().name(), new StixString(String.valueOf(result.getAverageScore())));
    }

    return new io.openbas.stix.types.Dictionary(coverageValues);
  }

  private BaseType<?> uncovered() {
    return new io.openbas.stix.types.Dictionary(new HashMap<>());
  }
}
