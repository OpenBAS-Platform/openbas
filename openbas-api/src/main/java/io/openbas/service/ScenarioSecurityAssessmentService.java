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
    List<String> attackPatternIds =
        attackPatternService
            .getAttackPatternsByExternalIdsThrowIfMissing(
                securityAssessment.getAttackPatternRefs().stream()
                    .map(StixRefToExternalRef::getExternalRef)
                    .collect(Collectors.toSet()))
            .stream()
            .map(AttackPattern::getId)
            .toList();

    if (attackPatternIds.isEmpty()) {
      injectService.deleteAll(scenario.getInjects());
    }

    // 2. Fetch asset groups via tag rules
    List<String> tagIds = scenario.getTags().stream().map(Tag::getId).toList();
    List<AssetGroup> assetGroups = tagRuleService.getAssetGroupsFromTagIds(tagIds);

    // 3. Get all endpoints per asset group
    Map<AssetGroup, List<Endpoint>> assetsFromGroupMap =
        assetGroupService.assetsFromAssetGroupMap(assetGroups);

    // 4. Compute all (Platform, Arch) configs across all endpoints
    List<Endpoint> endpoints =
        assetsFromGroupMap.values().stream().flatMap(List::stream).collect(Collectors.toList());
    Set<Pair<Endpoint.PLATFORM_TYPE, String>> allPlatformArchs =
        assetGroupService.computePairsPlatformArchitecture(endpoints);

    // 5. Build required (TTP × Platform × Arch) combinations
    Set<Triple<String, Endpoint.PLATFORM_TYPE, String>> requiredCombinations =
        buildCombinationTtpPlatformArchitecture(attackPatternIds, allPlatformArchs);

    // 6. Extract covered combinations from existing injects
    Map<Inject, Set<Triple<String, Endpoint.PLATFORM_TYPE, String>>> injectCoverageMap =
        extractCombinationTtpPlatformArchitecture(scenario);

    Set<Triple<String, Endpoint.PLATFORM_TYPE, String>> coveredCombinations =
        injectCoverageMap.values().stream().flatMap(Set::stream).collect(Collectors.toSet());

    // 7. Identify injects to delete: if all their combinations are irrelevant
    // 8. Delete injects
    RemoveInjectsNotPresentInRequiredCombinations(injectCoverageMap, requiredCombinations);

    // 9. Compute missing combinations
    // 10. Filter TTPs that are still missing
    // 11. Filter AssetGroups based on missing (Platform × Arch)
    MissingCombinations missingCOmbinations =
        getMissingCombinations(requiredCombinations, coveredCombinations, assetsFromGroupMap);

    // 12. Generate missing injects only for missing TTPs and relevant asset groups
    if (!missingCOmbinations.filteredTtpIds().isEmpty()) {
      injectAssistantService.generateInjectsByTTPs(
          scenario,
          new ArrayList<>(missingCOmbinations.filteredTtpIds()),
          1,
          missingCOmbinations.filteredAssetsFromGroupMap());
    }
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

  private record MissingCombinations(
      Set<String> filteredTtpIds, Map<AssetGroup, List<Endpoint>> filteredAssetsFromGroupMap) {}

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

  private void RemoveInjectsNotPresentInRequiredCombinations(
      Map<Inject, Set<Triple<String, Endpoint.PLATFORM_TYPE, String>>> injectCoverageMap,
      Set<Triple<String, Endpoint.PLATFORM_TYPE, String>> requiredCombinations) {
    // 7. Identify injects to delete: if all their combinations are irrelevant
    List<Inject> injectsToRemove =
        injectCoverageMap.entrySet().stream()
            .filter(entry -> entry.getValue().stream().noneMatch(requiredCombinations::contains))
            .map(Map.Entry::getKey)
            .toList();

    // 8. Remove outdated injects
    injectRepository.deleteAll(injectsToRemove);
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

  private static Map<Inject, Set<Triple<String, Endpoint.PLATFORM_TYPE, String>>>
      extractCombinationTtpPlatformArchitecture(Scenario scenario) {
    return scenario.getInjects().stream()
        .map(
            inject ->
                inject
                    .getInjectorContract()
                    .map(
                        ic -> {
                          String arch = ic.getArch().name();
                          Set<Endpoint.PLATFORM_TYPE> platforms =
                              new HashSet<>(Arrays.asList(ic.getPlatforms()));
                          return Map.entry(
                              inject,
                              ic.getAttackPatterns().stream()
                                  .flatMap(
                                      ap ->
                                          platforms.stream()
                                              .map(
                                                  platform ->
                                                      Triple.of(ap.getId(), platform, arch)))
                                  .collect(Collectors.toSet()));
                        }))
        .flatMap(Optional::stream)
        .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
  }
}
