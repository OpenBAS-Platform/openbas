package io.openbas.utils;

import io.openbas.asset.AssetGroupService;
import io.openbas.database.model.AttackPattern;
import io.openbas.database.model.Inject;
import io.openbas.database.raw.RawAsset;
import io.openbas.database.raw.RawAssetGroup;
import io.openbas.database.raw.RawInjectExpectation;
import io.openbas.database.raw.RawTeam;
import io.openbas.database.raw.impl.RawEndpoint;
import io.openbas.database.repository.AssetGroupRepository;
import io.openbas.database.repository.AssetRepository;
import io.openbas.database.repository.InjectExpectationRepository;
import io.openbas.database.repository.TeamRepository;
import io.openbas.rest.atomic_testing.form.InjectTargetWithResult;
import io.openbas.rest.inject.form.InjectExpectationResultsByAttackPattern;
import io.openbas.utils.AtomicTestingMapper.ExpectationResultsByType;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static java.util.Collections.emptyList;

@RequiredArgsConstructor
@Component
public class ResultUtils {

  private final InjectExpectationRepository injectExpectationRepository;
  private final TeamRepository teamRepository;
  private final AssetRepository assetRepository;
  private final AssetGroupRepository assetGroupRepository;
  private final AssetGroupService assetGroupService;

  // -- UTILS --
  public List<AtomicTestingMapper.ExpectationResultsByType> getResultsByTypes(List<String> injectIds) {
    if (injectIds != null) {
      return computeGlobalExpectationResults(injectIds);
    } else {
      return emptyList();
    }
  }

  public List<InjectTargetWithResult> getInjectTargetWithResults(List<String> injectIds) {
    if (injectIds != null) {
      return computeTargetResults(injectIds);
    } else {
      return emptyList();
    }
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


  // -- GLOBAL SCORE --
  public List<ExpectationResultsByType> computeGlobalExpectationResults(
      @NotNull List<String> injectIds) {
    return AtomicTestingUtils.getExpectationResultByTypesFromRaw(
        injectExpectationRepository.rawForComputeGlobalByIds(injectIds));
  }

  // -- TARGETS WITH RESULTS --
  public List<InjectTargetWithResult> computeTargetResults(
      @NotNull List<String> injectIds) {

    // -- EXPECTATIONS --
    List<RawInjectExpectation> rawInjectExpectations = injectExpectationRepository.rawByInjectId(injectIds);
    Map<String, List<RawInjectExpectation>> expectationMap = rawInjectExpectations
        .stream().collect(Collectors.groupingBy(RawInjectExpectation::getInject_id));

    // -- TEAMS INJECT --

    List<String> teamIds = rawInjectExpectations
        .stream()
        .map(RawInjectExpectation::getTeam_id)
        .filter(Objects::nonNull)
        .distinct()
        .toList();

    List<RawTeam> rawTeams = teamRepository.rawByIdsOrInjectIds(teamIds, injectIds);
    Map<String, RawTeam> teamMap = rawTeams.stream().collect(Collectors.toMap(RawTeam::getTeam_id, rawTeam ->rawTeam));

    // -- ASSETS GROUPS INJECT --
    List<String> assetGroupIds = rawInjectExpectations
        .stream()
        .map(RawInjectExpectation::getAsset_group_id)
        .filter(Objects::nonNull)
        .distinct()
        .toList();

    List<RawAssetGroup> rawAssetGroups = assetGroupRepository.rawByIdsOrInjectIds(assetGroupIds, injectIds);
    Map<String, RawAssetGroup> assetGroupMap = rawAssetGroups.stream().collect(Collectors.toMap(RawAssetGroup::getAsset_group_id, rawAssetGroup ->rawAssetGroup));

    // -- ASSETS INJECT --
    List<String> assetIds = rawInjectExpectations
        .stream()
        .map(RawInjectExpectation::getAsset_id)
        .filter(Objects::nonNull)
        .distinct()
        .toList();

    assetIds.addAll(rawAssetGroups
        .stream()
        .flatMap(rawAssetGroup -> rawAssetGroup.getAsset_ids().stream())
        .distinct().toList());

    List<RawAsset> rawAssets = assetRepository.rawByIdsOrInjectIds(assetIds, injectIds);
    Map<String, RawAsset> assetMap = rawAssets.stream().collect(Collectors.toMap(RawAsset::getAsset_id, rawAsset ->rawAsset));

    Map<String, List<RawEndpoint>> dynamicForAssetGroupMap = assetGroupService.computeDynamicAssetFromRaw(
        rawAssetGroups);

    return injectIds.stream()
        .flatMap(
            injectId -> {
              return AtomicTestingUtils.getTargetsWithResultsFromRaw(
                  expectationMap.getOrDefault(injectId, emptyList()),
                  teamMap,
                  assetMap,
                  assetGroupMap,
                  dynamicForAssetGroupMap
              ).stream();
            })
        .distinct()
        .toList();
  }

}
