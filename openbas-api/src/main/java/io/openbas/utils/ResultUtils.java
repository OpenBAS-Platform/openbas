package io.openbas.utils;

import io.openbas.asset.AssetGroupService;
import io.openbas.database.model.AttackPattern;
import io.openbas.database.model.Inject;
import io.openbas.database.model.InjectExpectation;
import io.openbas.database.raw.RawAsset;
import io.openbas.database.raw.RawAssetGroup;
import io.openbas.database.raw.RawInjectExpectationForCompute;
import io.openbas.database.raw.RawTeam;
import io.openbas.database.repository.*;
import io.openbas.rest.atomic_testing.form.InjectTargetWithResult;
import io.openbas.rest.inject.form.InjectExpectationResultsByAttackPattern;
import io.openbas.utils.AtomicTestingMapper.ExpectationResultsByType;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static io.openbas.utils.AtomicTestingUtils.getTargetsWithResults;
import static io.openbas.utils.AtomicTestingUtils.getTargetsWithResultsWithRawQueries;

public class ResultUtils {

  private ResultUtils() {
  }

  // -- GLOBAL SCORE --

  public static List<ExpectationResultsByType> computeGlobalExpectationResults(@NotNull final List<Inject> injects) {
    List<InjectExpectation> expectations = injects
        .stream()
        .flatMap(inject -> inject.getExpectations().stream())
        .filter(expectation -> expectation.getUser() == null) // Filter expectations linked to players
        .toList();
    return AtomicTestingUtils.getExpectationResultByTypes(expectations);
  }

  public static List<ExpectationResultsByType> computeGlobalExpectationResults_raw(
      @NotNull final List<RawInjectExpectationForCompute> rawInjectExpectations) {
    return AtomicTestingUtils.getRawExpectationResultByTypesForCompute(rawInjectExpectations);
  }

  public static List<InjectExpectationResultsByAttackPattern> computeInjectExpectationResults(
      @NotNull final List<Inject> injects) {

    Map<AttackPattern, List<Inject>> groupedByAttackPattern = injects.stream()
        .flatMap(inject -> inject.getInjectorContract()
            .map(contract -> contract.getAttackPatterns().stream()
                .map(attackPattern -> Map.entry(attackPattern, inject)))
            .orElseGet(Stream::empty))
        .collect(Collectors.groupingBy(
            Map.Entry::getKey,
            Collectors.mapping(Map.Entry::getValue, Collectors.toList())
        ));

    return groupedByAttackPattern.entrySet()
        .stream()
        .map(entry -> new InjectExpectationResultsByAttackPattern(entry.getKey(), entry.getValue()))
        .toList();
  }

  // -- TARGET --

  public static List<InjectTargetWithResult> computeTargetResults(@NotNull List<Inject> injects) {
    return injects.stream()
        .flatMap(inject -> getTargetsWithResults(inject).stream())
        .distinct()
        .toList();
  }

  public static List<InjectTargetWithResult> computeTargetResultsWithRawExercise(@NotNull List<Inject> injects,
      InjectRepository injectRepository, InjectExpectationRepository injectExpectationRepository,
      TeamRepository teamRepository, AssetRepository assetRepository, AssetGroupRepository assetGroupRepository,
      AssetGroupService assetGroupService) {

    List<String> injectIds = injects.stream().map(Inject::getId).toList();

    Map<String, Map<String, RawTeam>> teamMap = teamRepository.rawTeamByInjectIds(injectIds).stream()
        .collect(Collectors.groupingBy(RawTeam::getInject_id,
            Collectors.toMap(
            RawTeam::getTeam_id,
            rawTeam -> rawTeam
        )));

    Map<String, Map<String, RawAsset>> assetMap = assetRepository.rawByInjectIds(injectIds).stream()
        .collect(Collectors.groupingBy(RawAsset::getInject_id,
            Collectors.toMap(
            RawAsset::getAsset_id,
            rawAsset -> rawAsset
        )));

    // -- ASSETS GROUPS --
    List<RawAssetGroup> rawAssetGroups = assetGroupRepository.rawByInjectIds(injectIds);

    Map<String, Map<String, RawAssetGroup>> assetGroupMap = rawAssetGroups.stream()
        .collect(Collectors.groupingBy(RawAssetGroup::getInject_id,
            Collectors.toMap(
            RawAssetGroup::getAsset_group_id,
            rawAssetGroup -> rawAssetGroup
        )));

  Map<String, List<RawAsset>> dynamicForAssetGroupMap = assetGroupService.computeRawDynamicAsset(rawAssetGroups);

    Map<String, RawAsset> assetForAssetGroupMap = assetRepository.rawByIds(
        rawAssetGroups.stream()
            .flatMap(rawAssetGroup -> rawAssetGroup.getAsset_ids().stream())
            .distinct().toList()).stream().collect(Collectors.toMap(RawAsset::getAsset_id, asset -> asset));


    return injects.stream()
        .flatMap(
            inject -> getTargetsWithResultsWithRawQueries(inject.getId(), injectRepository, injectExpectationRepository,
                teamMap.get(inject.getId()), assetMap.get(inject.getId()), assetGroupMap.get(inject.getId()), assetForAssetGroupMap, dynamicForAssetGroupMap).stream())
        .distinct()
        .toList();
  }
}
