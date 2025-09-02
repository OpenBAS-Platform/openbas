package io.openbas.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import io.openbas.database.model.*;
import io.openbas.rest.attack_pattern.service.AttackPatternService;
import io.openbas.rest.exercise.service.ExerciseService;
import io.openbas.stix.objects.Bundle;
import io.openbas.stix.objects.DomainObject;
import io.openbas.stix.objects.ObjectBase;
import io.openbas.stix.objects.RelationshipObject;
import io.openbas.stix.objects.constants.CommonProperties;
import io.openbas.stix.objects.constants.ObjectTypes;
import io.openbas.stix.parsing.Parser;
import io.openbas.stix.parsing.ParsingException;
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
public class SecurityCoverageService {
  private final Parser stixParser;
  private final AttackPatternService attackPatternService;
  private final ResultUtils resultUtils;
  private final ExerciseService exerciseService;
  private final AssetService assetService;

  public Bundle createBundleFromSendJobs(List<SecurityCoverageSendJob> securityCoverageSendJobs)
      throws ParsingException, JsonProcessingException {
    List<ObjectBase> objects = new ArrayList<>();
    for (SecurityCoverageSendJob securityCoverageSendJob : securityCoverageSendJobs) {
      SecurityAssessment sa = securityCoverageSendJob.getSimulation().getSecurityAssessment();
      if (sa == null) {
        continue;
      }

      Exercise ex = securityCoverageSendJob.getSimulation();
      objects.addAll(this.getCoverageForSimulation(ex));
    }

    return new Bundle(new Identifier("bundle--" + UUID.randomUUID()), objects);
  }

  private List<ObjectBase> getCoverageForSimulation(Exercise exercise)
      throws ParsingException, JsonProcessingException {
    List<ObjectBase> objects = new ArrayList<>();

    // create the main coverage object
    SecurityAssessment assessment = exercise.getSecurityAssessment();
    DomainObject coverage = (DomainObject) stixParser.parseObject(assessment.getContent());
    coverage.setProperty(CommonProperties.MODIFIED.toString(), new Timestamp(Instant.now()));
    coverage.setProperty("coverage", getOverallCoverage(exercise));
    objects.add(coverage);

    // start and stop times
    Optional<Timestamp> sroStartTime = exercise.getStart().map(Timestamp::new);
    Optional<Timestamp> sroStopTime =
        exerciseService.getLatestValidityDate(exercise).map(Timestamp::new);

    for (StixRefToExternalRef stixRef : exercise.getSecurityAssessment().getAttackPatternRefs()) {
      BaseType<?> attackPatternCoverage =
          getAttackPatternCoverage(stixRef.getExternalRef(), exercise);
      boolean covered = !((Map<String, BaseType<?>>) attackPatternCoverage.getValue()).isEmpty();
      RelationshipObject sro =
          new RelationshipObject(
              new HashMap<>(
                  Map.of(
                      CommonProperties.ID.toString(),
                      new Identifier(ObjectTypes.RELATIONSHIP + "--" + exercise.getId()),
                      CommonProperties.TYPE.toString(),
                      new StixString(ObjectTypes.RELATIONSHIP.toString()),
                      "relationship_type",
                      new StixString("has-assessed"),
                      RelationshipObject.Properties.SOURCE_REF.toString(),
                      coverage.getId(),
                      RelationshipObject.Properties.TARGET_REF.toString(),
                      new Identifier(stixRef.getStixRef()),
                      "covered",
                      new io.openbas.stix.types.Boolean(covered))));
      sroStartTime.ifPresent(instant -> sro.setProperty("start_time", instant));
      sroStopTime.ifPresent(instant -> sro.setProperty("stop_time", instant));
      if (covered) {
        sro.setProperty("coverage", attackPatternCoverage);
      }
      objects.add(sro);
    }

    for (SecurityPlatform securityPlatform : assetService.securityPlatforms()) {
      DomainObject platformIdentity = securityPlatform.toStixDomainObject();
      objects.add(platformIdentity);

      BaseType<?> platformCoverage = getOverallCoveragePerPlatform(exercise, securityPlatform);
      boolean covered = !((Map<String, BaseType<?>>) platformCoverage.getValue()).isEmpty();
      RelationshipObject sro =
          new RelationshipObject(
              new HashMap<>(
                  Map.of(
                      CommonProperties.ID.toString(),
                      new Identifier(ObjectTypes.RELATIONSHIP + "--" + UUID.randomUUID()),
                      CommonProperties.TYPE.toString(),
                      new StixString(ObjectTypes.RELATIONSHIP.toString()),
                      "relationship_type",
                      new StixString("has-assessed"),
                      RelationshipObject.Properties.SOURCE_REF.toString(),
                      coverage.getId(),
                      RelationshipObject.Properties.TARGET_REF.toString(),
                      platformIdentity.getId(),
                      "covered",
                      new io.openbas.stix.types.Boolean(covered))));
      sroStartTime.ifPresent(instant -> sro.setProperty("start_time", instant));
      sroStopTime.ifPresent(instant -> sro.setProperty("stop_time", instant));
      if (covered) {
        sro.setProperty("coverage", platformCoverage);
      }
      objects.add(sro);
    }

    return objects;
  }

  private BaseType<?> getOverallCoverage(Exercise exercise) {
    return computeCoverageFromInjects(exercise.getInjects());
  }

  private BaseType<?> getOverallCoveragePerPlatform(
      Exercise exercise, SecurityPlatform securityPlatform) {
    return computeCoverageFromInjects(exercise.getInjects(), securityPlatform);
  }

  private BaseType<?> getAttackPatternCoverage(String externalRef, Exercise exercise) {
    List<AttackPattern> apList =
        attackPatternService.getAttackPatternsByExternalIdsThrowIfMissing(Set.of(externalRef));
    Optional<AttackPattern> ap = apList.stream().findFirst();
    if (ap.isEmpty()) {
      return uncovered();
    }

    // get all injects involved in attack pattern
    List<Inject> injects =
        exercise.getInjects().stream()
            .filter(
                i ->
                    i.getInjectorContract().isPresent()
                        && i.getInjectorContract().get().getAttackPatterns().stream()
                            .anyMatch(
                                attackPattern -> attackPattern.getId().equals(ap.get().getId())))
            .toList();
    if (injects.isEmpty()) {
      return uncovered();
    }

    return computeCoverageFromInjects(injects);
  }

  private BaseType<?> computeCoverageFromInjects(
      List<Inject> injects, SecurityPlatform securityPlatform) {
    List<InjectExpectationResultUtils.ExpectationResultsByType> coverageResults =
        resultUtils.computeGlobalExpectationResultsForPlatform(
            injects.stream().map(Inject::getId).collect(Collectors.toSet()), securityPlatform);

    Map<String, BaseType<?>> coverageValues = new HashMap<>();
    for (InjectExpectationResultUtils.ExpectationResultsByType result : coverageResults) {
      coverageValues.put(
          result.type().name(), new StixString(String.valueOf(result.getSuccessRate())));
    }
    return new io.openbas.stix.types.Dictionary(coverageValues);
  }

  private BaseType<?> computeCoverageFromInjects(List<Inject> injects) {
    List<InjectExpectationResultUtils.ExpectationResultsByType> coverageResults =
        resultUtils.computeGlobalExpectationResults(
            injects.stream().map(Inject::getId).collect(Collectors.toSet()));

    Map<String, BaseType<?>> coverageValues = new HashMap<>();
    for (InjectExpectationResultUtils.ExpectationResultsByType result : coverageResults) {
      coverageValues.put(
          result.type().name(), new StixString(String.valueOf(result.getSuccessRate())));
    }
    return new io.openbas.stix.types.Dictionary(coverageValues);
  }

  private BaseType<?> uncovered() {
    return new io.openbas.stix.types.Dictionary(new HashMap<>());
  }
}
