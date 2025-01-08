package io.openbas.utils;

import static java.util.Collections.emptyList;

import io.openbas.database.model.AttackPattern;
import io.openbas.database.model.Endpoint;
import io.openbas.database.model.Inject;
import io.openbas.database.raw.*;
import io.openbas.database.repository.*;
import io.openbas.rest.atomic_testing.form.InjectTargetWithResult;
import io.openbas.rest.inject.form.InjectExpectationResultsByAttackPattern;
import io.openbas.service.AssetGroupService;
import io.openbas.utils.AtomicTestingUtils.ExpectationResultsByType;
import jakarta.validation.constraints.NotNull;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@RequiredArgsConstructor
@Component
public class ResultUtils {

  private final InjectExpectationRepository injectExpectationRepository;
  private final TeamRepository teamRepository;
  private final UserRepository userRepository;
  private final AssetRepository assetRepository;
  private final AssetGroupRepository assetGroupRepository;
  private final AssetGroupService assetGroupService;

  // -- UTILS --
  public List<ExpectationResultsByType> getResultsByTypes(Set<String> injectIds) {
    if (injectIds == null || injectIds.isEmpty()) {
      return emptyList();
    }
    return computeGlobalExpectationResults(injectIds);
  }

  public List<InjectTargetWithResult> getInjectTargetWithResults(Set<String> injectIds) {
    if (injectIds == null || injectIds.isEmpty()) {
      return emptyList();
    }
    return computeTargetResults(injectIds);
  }

  public static List<InjectExpectationResultsByAttackPattern> computeInjectExpectationResults(
      @NotNull final List<Inject> injects) {

    Map<AttackPattern, List<Inject>> groupedByAttackPattern =
        injects.stream()
            .flatMap(
                inject ->
                    inject
                        .getInjectorContract()
                        .map(
                            contract ->
                                contract.getAttackPatterns().stream()
                                    .map(attackPattern -> Map.entry(attackPattern, inject)))
                        .orElseGet(Stream::empty))
            .collect(
                Collectors.groupingBy(
                    Map.Entry::getKey,
                    Collectors.mapping(Map.Entry::getValue, Collectors.toList())));

    return groupedByAttackPattern.entrySet().stream()
        .map(entry -> new InjectExpectationResultsByAttackPattern(entry.getKey(), entry.getValue()))
        .toList();
  }

  // -- GLOBAL SCORE --
  public List<ExpectationResultsByType> computeGlobalExpectationResults(
      @NotNull Set<String> injectIds) {
    return AtomicTestingUtils.getExpectationResultByTypesFromRaw(
        injectExpectationRepository.rawForComputeGlobalByInjectIds(injectIds));
  }

  // -- TARGETS WITH RESULTS --
  public List<InjectTargetWithResult> computeTargetResults(@NotNull Set<String> injectIds) {

    // -- EXPECTATIONS --
    Set<RawInjectExpectation> rawInjectExpectations =
        injectExpectationRepository.rawByInjectIds(injectIds);
    Map<String, List<RawInjectExpectation>> expectationMap =
        rawInjectExpectations.stream()
            .collect(Collectors.groupingBy(RawInjectExpectation::getInject_id));

    // -- TEAMS INJECT --

    Set<String> teamIds =
        rawInjectExpectations.stream()
            .map(RawInjectExpectation::getTeam_id)
            .filter(Objects::nonNull)
            .collect(Collectors.toSet());

    Set<RawTeam> rawTeams = teamRepository.rawByIdsOrInjectIds(teamIds, injectIds);
    Map<String, RawTeam> teamMap =
        rawTeams.stream().collect(Collectors.toMap(RawTeam::getTeam_id, rawTeam -> rawTeam));

    // -- USER MAP FROM TEAMS --

    Set<String> userIds =
        rawInjectExpectations.stream()
            .map(RawInjectExpectation::getUser_id)
            .filter(Objects::nonNull)
            .collect(Collectors.toSet());

    Set<RawUser> rawUsers = userRepository.rawUserByIds(userIds);
    Map<String, RawUser> userMap =
        rawUsers.stream().collect(Collectors.toMap(RawUser::getUser_id, rawUser -> rawUser));

    // -- ASSETS GROUPS INJECT --
    Set<String> assetGroupIds =
        rawInjectExpectations.stream()
            .map(RawInjectExpectation::getAsset_group_id)
            .filter(Objects::nonNull)
            .collect(Collectors.toSet());

    Set<RawAssetGroup> rawAssetGroups =
        assetGroupRepository.rawByIdsOrInjectIds(assetGroupIds, injectIds);
    Map<String, RawAssetGroup> assetGroupMap =
        rawAssetGroups.stream()
            .collect(
                Collectors.toMap(RawAssetGroup::getAsset_group_id, rawAssetGroup -> rawAssetGroup));

    // -- ASSETS INJECT --
    Set<String> assetIds =
        rawInjectExpectations.stream()
            .map(RawInjectExpectation::getAsset_id)
            .filter(Objects::nonNull)
            .collect(Collectors.toSet());

    assetIds.addAll(
        rawAssetGroups.stream()
            .filter(rawAssetGroup -> rawAssetGroup.getAsset_ids() != null)
            .flatMap(rawAssetGroup -> rawAssetGroup.getAsset_ids().stream())
            .distinct()
            .toList());

    List<RawAsset> rawAssets = assetRepository.rawByIdsOrInjectIds(assetIds, injectIds);
    Map<String, RawAsset> assetMap =
        rawAssets.stream().collect(Collectors.toMap(RawAsset::getAsset_id, rawAsset -> rawAsset));

    Map<String, List<Endpoint>> dynamicForAssetGroupMap =
        assetGroupService.computeDynamicAssetFromRaw(rawAssetGroups);

    return injectIds.stream()
        .flatMap(
            injectId -> {
              return AtomicTestingUtils.getTargetsWithResultsFromRaw(
                  expectationMap.getOrDefault(injectId, emptyList()),
                  teamMap,
                  userMap,
                  assetMap,
                  assetGroupMap,
                  dynamicForAssetGroupMap)
                  .stream();
            })
        .distinct()
        .toList();
  }
}
