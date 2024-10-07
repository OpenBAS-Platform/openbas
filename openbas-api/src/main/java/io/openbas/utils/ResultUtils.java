package io.openbas.utils;

import io.openbas.asset.AssetGroupService;
import io.openbas.database.model.AttackPattern;
import io.openbas.database.model.Inject;
import io.openbas.database.raw.*;
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

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

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
    }else{
      return Collections.emptyList();
    }
  }

  public List<InjectTargetWithResult> getInjectTargetWithResults(List<String> injectIds) {
    if (injectIds != null) {
      return computeTargetResults(injectIds);
    }else{
      return Collections.emptyList();
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
    return AtomicTestingUtils.getExpectationResultByTypesFromRaw(injectExpectationRepository.rawForComputeGlobalByIds(injectIds));
  }

  // -- TARGETS WITH RESULTS --
  public List<InjectTargetWithResult> computeTargetResults(
      @NotNull List<String> injectIds) {

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

    Map<String, List<RawEndpoint>> dynamicForAssetGroupMap = assetGroupService.computeDynamicAssetFromRaw(rawAssetGroups);

    Map<String, RawAsset> assetForAssetGroupMap = assetRepository.rawByIds(
        rawAssetGroups.stream()
            .flatMap(rawAssetGroup -> rawAssetGroup.getAsset_ids().stream())
            .distinct().toList()).stream().collect(Collectors.toMap(RawAsset::getAsset_id, asset -> asset));

    return injectIds.stream()
        .flatMap(
            injectId -> {
              List<RawInjectExpectation> expectations = injectExpectationRepository.rawByInjectId(injectId);
              return AtomicTestingUtils.getTargetsWithResultsFromRaw(expectations,
                  teamMap.get(injectId),
                  assetMap.get(injectId),
                  assetGroupMap.get(injectId),
                  assetForAssetGroupMap,
                  dynamicForAssetGroupMap).stream();
            })
        .distinct()
        .toList();
  }

}
