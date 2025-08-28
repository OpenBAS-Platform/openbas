package io.openbas.service;

import static io.openbas.database.model.Payload.PAYLOAD_EXECUTION_ARCH.ALL_ARCHITECTURES;

import io.openbas.database.model.*;
import io.openbas.database.repository.InjectRepository;
import io.openbas.rest.attack_pattern.service.AttackPatternService;
import io.openbas.rest.inject.service.InjectAssistantService;
import io.openbas.rest.inject.service.InjectService;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.commons.lang3.tuple.Triple;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

@RequiredArgsConstructor
@Service
@Slf4j
@Validated
public class SecurityAssessmentInjectService {

  public static final int INJECTS_PER_TTP = 1;
  private final TagRuleService tagRuleService;
  private final InjectService injectService;
  private final InjectAssistantService injectAssistantService;
  private final AttackPatternService attackPatternService;
  private final AssetGroupService assetGroupService;

  private final InjectRepository injectRepository;

  /**
   * Creates and manages injects for the given scenario based on the associated security assessment.
   *
   * <p>Steps:
   *
   * <ul>
   *   <li>Resolves internal TTPs from the assessment
   *   <li>Fetches asset groups based on scenario tag rules
   *   <li>Analyzes existing inject coverage
   *   <li>Removes outdated injects
   *   <li>Generates missing injects depending on whether asset groups are available
   * </ul>
   *
   * @param scenario the scenario for which injects are managed
   * @param securityAssessment the related security assessment providing TTP references
   */
  public void createdInjectsForScenario(Scenario scenario, SecurityAssessment securityAssessment) {
    // 1. Fetch internal Ids for TTPs
    Map<String, AttackPattern> attackPatterns =
        fetchInternalTTPIdsFromSecurityAssessment(securityAssessment);

    if (attackPatterns.isEmpty()) {
      injectService.deleteAll(scenario.getInjects());
      return;
    }

    // 2. Fetch asset groups via tag rules
    List<AssetGroup> assetGroups = fetchAssetGroupsFromScenarioTagRules(scenario);

    // 3. Fetch Inject coverage
    Map<Inject, Set<Triple<String, Endpoint.PLATFORM_TYPE, String>>> injectCoverageMap =
        extractCombinationTtpPlatformArchitectureFromScenarioInjects(scenario);

    // 4. Get all endpoints per asset group
    Map<AssetGroup, List<Endpoint>> assetsFromGroupMap =
        assetGroupService.assetsFromAssetGroupMap(assetGroups);

    // Check if assetgroups are empties because it could reduce the code
    boolean assetGroupsAreEmpties =
        assetGroups.isEmpty() || assetsFromGroupMap.values().stream().allMatch(List::isEmpty);
    if (assetGroupsAreEmpties) {
      handleNoAssetGroupsCase(scenario, attackPatterns, injectCoverageMap);
    } else {
      handleWithAssetGroupsCase(scenario, assetsFromGroupMap, attackPatterns, injectCoverageMap);
    }
  }

  /**
   * Resolves external TTP references from a {@link SecurityAssessment} into internal {@link
   * AttackPattern} entities using the {@code attackPatternService}.
   *
   * @param securityAssessment the security assessment containing external TTP references
   * @return list of resolved internal AttackPattern entities
   */
  private Map<String, AttackPattern> fetchInternalTTPIdsFromSecurityAssessment(
      SecurityAssessment securityAssessment) {
    return attackPatternService
        .getAttackPatternsByExternalIds(
            securityAssessment.getAttackPatternRefs().stream()
                .map(StixRefToExternalRef::getExternalRef)
                .collect(Collectors.toSet()))
        .stream()
        .collect(Collectors.toMap(attack -> attack.getId(), Function.identity()));
  }

  /**
   * Retrieves asset groups for a scenario based on tag rules using the {@code tagRuleService}.
   *
   * @param scenario the scenario containing tag references
   * @return list of asset groups associated with the scenario tags
   */
  private List<AssetGroup> fetchAssetGroupsFromScenarioTagRules(Scenario scenario) {
    return tagRuleService.getAssetGroupsFromTagIds(
        scenario.getTags().stream().map(Tag::getId).toList());
  }

  /**
   * Extracts the inject coverage from the scenario's injects, mapping each inject to its set of
   * (TTP × Platform × Architecture) combinations.
   *
   * @param scenario the scenario containing injects
   * @return a map of injects to their TTP-platform-architecture combinations
   */
  private static Map<Inject, Set<Triple<String, Endpoint.PLATFORM_TYPE, String>>>
      extractCombinationTtpPlatformArchitectureFromScenarioInjects(Scenario scenario) {
    return scenario.getInjects().stream()
        .map(inject -> inject.getInjectorContract().map(ic -> Map.entry(inject, ic)))
        .flatMap(Optional::stream)
        .filter(
            entry -> {
              InjectorContract ic = entry.getValue();
              return ic.getArch() != null
                  && ic.getPlatforms() != null
                  && ic.getPlatforms().length > 0;
            })
        .map(
            entry -> {
              Inject inject = entry.getKey();
              InjectorContract ic = entry.getValue();
              Set<String> archs =
                  ALL_ARCHITECTURES.equals(ic.getArch())
                      ? Set.of("arm64", "x86_64")
                      : Set.of(ic.getArch().name());
              Set<Endpoint.PLATFORM_TYPE> platforms =
                  new HashSet<>(Arrays.asList(ic.getPlatforms()));

              Set<Triple<String, Endpoint.PLATFORM_TYPE, String>> combinations =
                  ic.getAttackPatterns().stream()
                      .flatMap(
                          ap ->
                              platforms.stream()
                                  .flatMap(
                                      p -> archs.stream().map(a -> Triple.of(ap.getId(), p, a))))
                      .collect(Collectors.toSet());

              return Map.entry(inject, combinations);
            })
        .collect(
            Collectors.toMap(
                Map.Entry::getKey,
                Map.Entry::getValue,
                (v1, v2) -> {
                  v1.addAll(v2);
                  return v1;
                }));
  }

  /**
   * Handles inject deletion and generation when asset groups and endpoints are available.
   *
   * <p>Performs:
   *
   * <ul>
   *   <li>Required combination computation
   *   <li>Comparison with existing injects
   *   <li>Obsolete inject deletion
   *   <li>Missing inject generation
   * </ul>
   *
   * @param scenario the scenario being processed
   * @param assetsFromGroupMap the available asset groups and their endpoints
   * @param attackPatterns list of required TTPs
   * @param injectCoverageMap existing inject coverage
   */
  private void handleWithAssetGroupsCase(
      Scenario scenario,
      Map<AssetGroup, List<Endpoint>> assetsFromGroupMap,
      Map<String, AttackPattern> attackPatterns,
      Map<Inject, Set<Triple<String, Endpoint.PLATFORM_TYPE, String>>> injectCoverageMap) {

    // 5. Compute all (Platform, Arch) configs across all endpoints
    List<Endpoint> endpoints =
        assetsFromGroupMap.values().stream().flatMap(List::stream).collect(Collectors.toList());
    Set<Pair<Endpoint.PLATFORM_TYPE, String>> allPlatformArchs =
        assetGroupService.computePairsPlatformArchitecture(endpoints);

    // 6. Build required (TTP × Platform × Arch) combinations
    Set<Triple<String, Endpoint.PLATFORM_TYPE, String>> requiredCombinations =
        buildCombinationTtpPlatformArchitecture(attackPatterns.keySet(), allPlatformArchs);

    // 7. Extract covered combinations from existing injects
    Set<Triple<String, Endpoint.PLATFORM_TYPE, String>> coveredCombinations =
        injectCoverageMap.values().stream().flatMap(Set::stream).collect(Collectors.toSet());

    // 8. Identify injects to delete: if all their combinations are irrelevant
    // 9. Delete injects
    removeInjectsNoLongerNecessary(injectCoverageMap, requiredCombinations);

    // 10. Compute missing combinations
    // 11. Filter TTPs that are still missing
    // 12. Filter AssetGroups based on missing (Platform × Arch)
    MissingCombinations missingCombinations =
        getMissingCombinations(requiredCombinations, coveredCombinations, assetsFromGroupMap);

    // 13. Generate missing injects only for missing TTPs and relevant asset groups
    if (!missingCombinations.filteredTtps().isEmpty()) {
      Set<AttackPattern> missingAttacks =
          missingCombinations.filteredTtps().stream()
              .map(attackPatterns::get)
              .filter(Objects::nonNull)
              .collect(Collectors.toSet());
      injectAssistantService.generateInjectsByTTPsWithAssetGroups(
          scenario,
          missingAttacks,
          INJECTS_PER_TTP,
          missingCombinations.filteredAssetsFromGroupMap());
    }
  }

  /**
   * Handles inject deletion and generation when no asset groups are defined or available.
   *
   * <p>Only required TTPs are used to determine what to remove or generate.
   *
   * @param scenario the scenario being processed
   * @param requiredTtps list of required TTPs
   * @param injectCoverageMap current inject coverage
   */
  private void handleNoAssetGroupsCase(
      Scenario scenario,
      Map<String, AttackPattern> requiredTtps,
      Map<Inject, Set<Triple<String, Endpoint.PLATFORM_TYPE, String>>> injectCoverageMap) {
    Set<String> coveredTtps =
        injectCoverageMap.values().stream()
            .flatMap(Set::stream)
            .map(Triple::getLeft)
            .collect(Collectors.toSet());

    // 5. Remove Ttps already covered
    Set<String> requiredTtpIds = requiredTtps.keySet();

    Set<String> missingTtps = new HashSet<>(requiredTtpIds);
    missingTtps.removeAll(coveredTtps);

    // 6. Remove injects not in requiredTtps
    List<Inject> injectsToRemove =
        injectCoverageMap.entrySet().stream()
            .filter(
                entry -> {
                  Set<Triple<String, Endpoint.PLATFORM_TYPE, String>> triples = entry.getValue();
                  return triples.stream().map(Triple::getLeft).noneMatch(requiredTtpIds::contains);
                })
            .map(Map.Entry::getKey)
            .toList();

    injectRepository.deleteAll(injectsToRemove);

    // 7. Generate missing injects only for missing TTPs and relevant asset groups
    if (!missingTtps.isEmpty()) {
      Set<AttackPattern> missingAttacks =
          missingTtps.stream()
              .map(requiredTtps::get)
              .filter(Objects::nonNull)
              .collect(Collectors.toSet());
      injectAssistantService.generateInjectsByTTPsWithoutAssetGroups(
          scenario, missingAttacks, INJECTS_PER_TTP);
    }
  }

  /**
   * Builds the complete set of required combinations of TTPs and platform-architecture pairs.
   *
   * @param attackPatterns list of attack patterns (TTPs)
   * @param allPlatformArchs set of platform-architecture pairs
   * @return set of (TTP × Platform × Architecture) combinations
   */
  private static Set<Triple<String, Endpoint.PLATFORM_TYPE, String>>
      buildCombinationTtpPlatformArchitecture(
          Set<String> attackPatterns, Set<Pair<Endpoint.PLATFORM_TYPE, String>> allPlatformArchs) {
    return attackPatterns.stream()
        .flatMap(
            ttp -> allPlatformArchs.stream().map(pa -> Triple.of(ttp, pa.getLeft(), pa.getRight())))
        .collect(Collectors.toSet());
  }

  /**
   * Computes the missing combinations by comparing required vs. covered combinations. Filters the
   * missing TTPs and identifies the relevant asset groups.
   *
   * @param requiredCombinations expected combinations to be covered
   * @param coveredCombinations currently covered combinations
   * @param assetsFromGroupMap map of asset groups to endpoints
   * @return a {@link MissingCombinations} object containing uncovered TTPs and relevant assets
   */
  private MissingCombinations getMissingCombinations(
      Set<Triple<String, Endpoint.PLATFORM_TYPE, String>> requiredCombinations,
      Set<Triple<String, Endpoint.PLATFORM_TYPE, String>> coveredCombinations,
      Map<AssetGroup, List<Endpoint>> assetsFromGroupMap) {
    Set<Triple<String, Endpoint.PLATFORM_TYPE, String>> missingCombinations =
        new HashSet<>(requiredCombinations);
    missingCombinations.removeAll(coveredCombinations);

    // 10. Filter TTPs that are still missing
    Set<String> filteredTtps =
        missingCombinations.stream().map(Triple::getLeft).collect(Collectors.toSet());

    // 11. Filter AssetGroups based on missing (Platform × Arch)
    Map<AssetGroup, List<Endpoint>> filteredAssetsFromGroupMap =
        computeMissingAssetGroups(missingCombinations, assetsFromGroupMap);

    return new MissingCombinations(filteredTtps, filteredAssetsFromGroupMap);
  }

  /**
   * Filters and returns asset groups whose endpoints match any of the missing platform-architecture
   * combinations.
   *
   * @param missingCombinations set of missing TTP-platform-architecture triples
   * @param assetsFromGroupMap all asset groups and their endpoints
   * @return filtered map of asset groups relevant to the missing combinations
   */
  private Map<AssetGroup, List<Endpoint>> computeMissingAssetGroups(
      Set<Triple<String, Endpoint.PLATFORM_TYPE, String>> missingCombinations,
      Map<AssetGroup, List<Endpoint>> assetsFromGroupMap) {
    Set<Pair<Endpoint.PLATFORM_TYPE, String>> missingPlatformArchs =
        missingCombinations.stream()
            .map(triple -> Pair.of(triple.getMiddle(), triple.getRight()))
            .collect(Collectors.toSet());

    List<AssetGroup> filteredAssetGroups =
        assetsFromGroupMap.entrySet().stream()
            .filter(
                entry ->
                    assetGroupService.computePairsPlatformArchitecture(entry.getValue()).stream()
                        .anyMatch(missingPlatformArchs::contains))
            .map(Map.Entry::getKey)
            .toList();

    return assetsFromGroupMap.entrySet().stream()
        .filter(entry -> filteredAssetGroups.contains(entry.getKey()))
        .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
  }

  /**
   * Removes injects that do not match any of the required (TTP × Platform × Architecture)
   * combinations.
   *
   * @param injectCoverageMap current inject coverage
   * @param requiredCombinations all required combinations
   */
  private void removeInjectsNoLongerNecessary(
      Map<Inject, Set<Triple<String, Endpoint.PLATFORM_TYPE, String>>> injectCoverageMap,
      Set<Triple<String, Endpoint.PLATFORM_TYPE, String>> requiredCombinations) {
    // 7. Identify injects to delete: if all their combinations are irrelevant
    // TODO Remove inject Placeholders

    // Inject with configuration outdated
    List<Inject> injectsToRemove =
        injectCoverageMap.entrySet().stream()
            .filter(entry -> entry.getValue().stream().noneMatch(requiredCombinations::contains))
            .map(Map.Entry::getKey)
            .toList();

    // 8. Remove outdated injects
    injectRepository.deleteAll(injectsToRemove);
  }

  /**
   * Record representing the result of a missing combination analysis, containing uncovered TTPs and
   * the filtered asset groups relevant to them.
   *
   * @param filteredTtps set of uncovered TTPs
   * @param filteredAssetsFromGroupMap map of relevant asset groups with their endpoints
   */
  private record MissingCombinations(
      Set<String> filteredTtps, Map<AssetGroup, List<Endpoint>> filteredAssetsFromGroupMap) {}
}
