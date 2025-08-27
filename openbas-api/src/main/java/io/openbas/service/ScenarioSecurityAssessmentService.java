package io.openbas.service;

import static io.openbas.utils.TimeUtils.getCronExpression;

import io.openbas.database.model.*;
import io.openbas.database.repository.InjectRepository;
import io.openbas.database.repository.ScenarioRepository;
import io.openbas.rest.attack_pattern.service.AttackPatternService;
import io.openbas.rest.inject.service.InjectAssistantService;
import io.openbas.rest.inject.service.InjectService;
import io.openbas.rest.tag.TagService;
import java.time.Instant;
import java.util.*;
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
public class ScenarioSecurityAssessmentService {

  public static final String INCIDENT_RESPONSE = "incident-response";

  private final ScenarioService scenarioService;
  private final TagRuleService tagRuleService;
  private final InjectService injectService;
  private final TagService tagService;
  private final InjectAssistantService injectAssistantService;
  private final AttackPatternService attackPatternService;
  private final AssetGroupService assetGroupService;

  private final InjectRepository injectRepository;
  private final ScenarioRepository scenarioRepository;

  public Scenario buildScenarioFromSecurityAssessment(SecurityAssessment securityAssessment) {
    Scenario scenario = updateOrCreateScenarioFromSecurityAssessment(securityAssessment);
    securityAssessment.setScenario(scenario);
    createdInjectsForScenario(scenario, securityAssessment);
    return scenario;
  }

  public Scenario updateOrCreateScenarioFromSecurityAssessment(SecurityAssessment sa) {
    if (sa.getScenario() != null) {
      return scenarioRepository
          .findById(sa.getScenario().getId())
          .map(existing -> updateScenarioFromSecurityAssessment(existing, sa))
          .orElseGet(() -> createAndInitializeScenario(sa));
    }
    return createAndInitializeScenario(sa);
  }

  private Scenario createAndInitializeScenario(SecurityAssessment sa) {
    Scenario scenario = new Scenario();
    updatePropertiesFromSecurityAssessment(scenario, sa);
    return scenarioService.createScenario(scenario);
  }

  private Scenario updateScenarioFromSecurityAssessment(Scenario scenario, SecurityAssessment sa) {
    updatePropertiesFromSecurityAssessment(scenario, sa);
    return scenarioService.updateScenario(scenario);
  }

  private void updatePropertiesFromSecurityAssessment(Scenario scenario, SecurityAssessment sa) {
    scenario.setSecurityAssessment(sa);
    scenario.setName(sa.getName());
    scenario.setDescription(sa.getDescription());
    scenario.setSeverity(Scenario.SEVERITY.high);
    scenario.setMainFocus(INCIDENT_RESPONSE);

    Instant start = sa.getPeriodStart();
    Instant end = sa.getPeriodEnd();

    scenario.setRecurrenceStart(start);
    scenario.setRecurrenceEnd(end);

    String cron = getCronExpression(sa.getScheduling(), start);
    scenario.setRecurrence(cron);

    scenario.setTags(tagService.buildDefaultTagsForStix());
  }

  private void createdInjectsForScenario(Scenario scenario, SecurityAssessment securityAssessment) {
    // 1. Fetch internal Ids for TTPs
    List<String> attackPatternIds = fetchInternalTTPIdsFromSecurityAssessment(securityAssessment);

    if (attackPatternIds.isEmpty()) {
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

    if (assetGroups.isEmpty() || assetsFromGroupMap.values().stream().allMatch(List::isEmpty)) {
      handleNoAssetGroupsCase(scenario, attackPatternIds, injectCoverageMap);
    } else {
      handleWithAssetGroupsCase(scenario, assetsFromGroupMap, attackPatternIds, injectCoverageMap);
    }
  }

  private List<String> fetchInternalTTPIdsFromSecurityAssessment(
      SecurityAssessment securityAssessment) {
    return attackPatternService
        .getAttackPatternsByExternalIdsThrowIfMissing(
            securityAssessment.getAttackPatternRefs().stream()
                .map(StixRefToExternalRef::getExternalRef)
                .collect(Collectors.toSet()))
        .stream()
        .map(AttackPattern::getId)
        .toList();
  }

  private List<AssetGroup> fetchAssetGroupsFromScenarioTagRules(Scenario scenario) {
    return tagRuleService.getAssetGroupsFromTagIds(
        scenario.getTags().stream().map(Tag::getId).toList());
  }

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
              String arch = ic.getArch().name();
              Set<Endpoint.PLATFORM_TYPE> platforms =
                  new HashSet<>(Arrays.asList(ic.getPlatforms()));

              Set<Triple<String, Endpoint.PLATFORM_TYPE, String>> combinations =
                  ic.getAttackPatterns().stream()
                      .flatMap(ap -> platforms.stream().map(p -> Triple.of(ap.getId(), p, arch)))
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

  private void handleWithAssetGroupsCase(
      Scenario scenario,
      Map<AssetGroup, List<Endpoint>> assetsFromGroupMap,
      List<String> attackPatternIds,
      Map<Inject, Set<Triple<String, Endpoint.PLATFORM_TYPE, String>>> injectCoverageMap) {

    // 5. Compute all (Platform, Arch) configs across all endpoints
    List<Endpoint> endpoints =
        assetsFromGroupMap.values().stream().flatMap(List::stream).collect(Collectors.toList());
    Set<Pair<Endpoint.PLATFORM_TYPE, String>> allPlatformArchs =
        assetGroupService.computePairsPlatformArchitecture(endpoints);

    // 6. Build required (TTP × Platform × Arch) combinations
    Set<Triple<String, Endpoint.PLATFORM_TYPE, String>> requiredCombinations =
        buildCombinationTtpPlatformArchitecture(attackPatternIds, allPlatformArchs);

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
    if (!missingCombinations.filteredTtpIds().isEmpty()) {
      injectAssistantService.generateInjectsByTTPs(
          scenario,
          new ArrayList<>(missingCombinations.filteredTtpIds()),
          1,
          missingCombinations.filteredAssetsFromGroupMap());
    }
  }

  private void handleNoAssetGroupsCase(
      Scenario scenario,
      List<String> requiredTtpIds,
      Map<Inject, Set<Triple<String, Endpoint.PLATFORM_TYPE, String>>> injectCoverageMap) {
    Set<String> coveredTtpIds =
        injectCoverageMap.values().stream()
            .flatMap(Set::stream)
            .map(Triple::getLeft)
            .collect(Collectors.toSet());

    // 5. Remove Ttps already covered
    Set<String> missingTtpIds = new HashSet<>(requiredTtpIds);
    missingTtpIds.removeAll(coveredTtpIds);

    // 6. Remove injects not in requiredTtpIds
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
    if (!missingTtpIds.isEmpty()) {
      injectAssistantService.generateInjectsByTTPs(
          scenario, new ArrayList<>(missingTtpIds), 1, Map.of());
    }
  }

  private static Set<Triple<String, Endpoint.PLATFORM_TYPE, String>>
      buildCombinationTtpPlatformArchitecture(
          List<String> attackPatternIds,
          Set<Pair<Endpoint.PLATFORM_TYPE, String>> allPlatformArchs) {
    return attackPatternIds.stream()
        .flatMap(
            ttp -> allPlatformArchs.stream().map(pa -> Triple.of(ttp, pa.getLeft(), pa.getRight())))
        .collect(Collectors.toSet());
  }

  private MissingCombinations getMissingCombinations(
      Set<Triple<String, Endpoint.PLATFORM_TYPE, String>> requiredCombinations,
      Set<Triple<String, Endpoint.PLATFORM_TYPE, String>> coveredCombinations,
      Map<AssetGroup, List<Endpoint>> assetsFromGroupMap) {
    Set<Triple<String, Endpoint.PLATFORM_TYPE, String>> missingCombinations =
        new HashSet<>(requiredCombinations);
    missingCombinations.removeAll(coveredCombinations);

    // 10. Filter TTPs that are still missing
    Set<String> filteredTtpIds =
        missingCombinations.stream().map(Triple::getLeft).collect(Collectors.toSet());

    // 11. Filter AssetGroups based on missing (Platform × Arch)
    Map<AssetGroup, List<Endpoint>> filteredAssetsFromGroupMap =
        computeMissingAssetGroups(missingCombinations, assetsFromGroupMap);

    return new MissingCombinations(filteredTtpIds, filteredAssetsFromGroupMap);
  }

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

  private record MissingCombinations(
      Set<String> filteredTtpIds, Map<AssetGroup, List<Endpoint>> filteredAssetsFromGroupMap) {}
}
