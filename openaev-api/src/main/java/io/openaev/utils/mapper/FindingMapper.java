package io.openaev.utils.mapper;

import io.openaev.database.model.*;
import io.openaev.database.repository.FindingRepository;
import io.openaev.rest.atomic_testing.form.TargetSimple;
import io.openaev.rest.finding.form.AggregatedFindingOutput;
import io.openaev.rest.finding.form.FindingSiblingOutput;
import io.openaev.rest.finding.form.RelatedFindingOutput;
import io.openaev.utils.TargetType;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@RequiredArgsConstructor
@Component
@Slf4j
public class FindingMapper {

  private final FindingRepository findingRepository;
  private final EndpointMapper endpointMapper;
  private final AssetGroupMapper assetGroupMapper;
  private final ExerciseMapper exerciseMapper;
  private final ScenarioMapper scenarioMapper;
  private final InjectMapper injectMapper;
  private final InjectorMapper injectorMapper;

  /**
   * Convenience single-finding overload (no bulk triage map available) - defaults {@code
   * finding_triage_status} to {@link FindingTriageStatus#UNTRIAGED} for every finding. Only
   * appropriate for one-off/test usage; callers mapping a page/list of findings MUST fetch triage
   * statuses in bulk (see {@code FindingTriageRepository#findByFinding_IdIn}) and use the overload
   * below instead, to avoid one triage query per finding (N+1).
   */
  public AggregatedFindingOutput toAggregatedFindingOutput(
      Finding finding, List<Asset> relatedAssets) {
    return toAggregatedFindingOutput(finding, relatedAssets, Map.of());
  }

  /**
   * Convenience overload for callers with bulk-fetched triage statuses but no group-wide first/last
   * seen computed yet (e.g. single-finding lookups) - defaults first/last seen to the given
   * finding's own dates.
   */
  public AggregatedFindingOutput toAggregatedFindingOutput(
      Finding finding,
      List<Asset> relatedAssets,
      Map<String, FindingTriageStatus> triageStatusByFindingId) {
    return toAggregatedFindingOutput(
        finding,
        relatedAssets,
        finding.getCreationDate(),
        finding.getUpdateDate(),
        triageStatusByFindingId);
  }

  /**
   * Aggregated (deduplicated by type + value [+ location, see FindingSpecification]) output. The
   * representative {@code finding} row is the most recent occurrence in the group (greatest {@code
   * updateDate}, tie-broken by smallest id - see {@code
   * FindingSpecification.distinctTypeValueWithFilter}), so its own {@code updateDate} already
   * matches the group last seen; its {@code creationDate}, however, is that single occurrence's, so
   * callers must still pass the group-wide first/last seen explicitly.
   */
  public AggregatedFindingOutput toAggregatedFindingOutput(
      Finding finding,
      List<Asset> relatedAssets,
      Instant firstSeen,
      Instant lastSeen,
      Map<String, FindingTriageStatus> triageStatusByFindingId) {
    return AggregatedFindingOutput.builder()
        .id(finding.getId())
        .value(finding.getValue())
        .type(finding.getType())
        .creationDate(firstSeen)
        .updateDate(lastSeen)
        .humanUpdateDate(finding.getHumanUpdateDate())
        .archivedAt(finding.getArchivedAt())
        // Findings can attach to ANY asset type (agentless websites, AI targets, cloud/network
        // assets), so no instanceof Endpoint filtering here.
        .assets(
            relatedAssets.stream()
                .map(endpointMapper::toEndpointSimple)
                .collect(Collectors.toSet()))
        // Derived from the same relatedAssets used above (not finding.getAssetGroups(), which
        // only reflects the single underlying finding's own inject) so the aggregated view shows
        // every asset group across all assets sharing this (type, value) pair.
        .assetGroups(
            relatedAssets.stream()
                .flatMap(asset -> asset.getAssetGroups().stream())
                .distinct()
                .map(assetGroupMapper::toAssetGroupSimple)
                .collect(Collectors.toSet()))
        .source(
            Optional.ofNullable(finding.getInject())
                .map(Inject::getInjector)
                .map(injectorMapper::toInjectorSimple)
                .orElse(null))
        .findingTriageStatus(
            triageStatusByFindingId.getOrDefault(finding.getId(), FindingTriageStatus.UNTRIAGED))
        .severity(finding.getSeverity())
        .resource(finding.getResource())
        .cloudAccount(finding.getCloudAccount())
        .cloudProvider(finding.getCloudProvider())
        .cloudRegion(finding.getCloudRegion())
        .remediation(finding.getRemediation())
        .compliance(finding.getCompliance())
        .build();
  }

  /**
   * Convenience single-finding overload - see {@link #toAggregatedFindingOutput(Finding, List)}'s
   * javadoc: defaults to UNTRIAGED, not for use in a loop.
   */
  public RelatedFindingOutput toRelatedFindingOutput(Finding finding) {
    return toRelatedFindingOutput(finding, Map.of());
  }

  public RelatedFindingOutput toRelatedFindingOutput(
      Finding finding, Map<String, FindingTriageStatus> triageStatusByFindingId) {
    return RelatedFindingOutput.builder()
        .id(finding.getId())
        .value(finding.getValue())
        .type(finding.getType())
        .updateDate(finding.getUpdateDate())
        .humanUpdateDate(finding.getHumanUpdateDate())
        .assets(
            finding.getAssets().stream()
                .map(asset -> endpointMapper.toEndpointSimple(asset))
                .collect(Collectors.toSet()))
        .assetGroups(
            finding.getAssetGroups().stream()
                .map(assetGroup -> assetGroupMapper.toAssetGroupSimple(assetGroup))
                .collect(Collectors.toSet()))
        .inject(injectMapper.toInjectSimple(finding.getInject()))
        .simulation(
            Optional.ofNullable(finding.getInject().getExercise())
                .map(exercise -> exerciseMapper.toExerciseSimple(exercise))
                .orElse(null))
        .scenario(
            Optional.ofNullable(finding.getInject().getExercise())
                .map(Exercise::getScenario)
                .map(scenario -> scenarioMapper.toScenarioSimple(scenario))
                .orElse(null))
        .source(
            Optional.ofNullable(finding.getInject())
                .map(Inject::getInjector)
                .map(injectorMapper::toInjectorSimple)
                .orElse(null))
        // Teams and persons attached to this occurrence (e.g. phishing credential findings): the
        // occurrence list needs them to show WHO was impacted, not only which machine.
        .teams(
            finding.getTeams().stream()
                .map(
                    team ->
                        TargetSimple.builder()
                            .id(team.getId())
                            .name(team.getName())
                            .type(TargetType.TEAMS)
                            .build())
                .collect(Collectors.toSet()))
        .users(
            finding.getUsers().stream()
                .map(
                    user ->
                        TargetSimple.builder()
                            .id(user.getId())
                            .name(user.getNameOrEmail())
                            .type(TargetType.PLAYERS)
                            .build())
                .collect(Collectors.toSet()))
        .creationDate(finding.getCreationDate())
        .findingTriageStatus(
            triageStatusByFindingId.getOrDefault(finding.getId(), FindingTriageStatus.UNTRIAGED))
        .build();
  }

  /**
   * Maps a sibling Finding for the "Also Detected On" panel (finding_triforce_design.md, Task 1):
   * unlike {@link #toAggregatedFindingOutput}, this does NOT aggregate assets/asset groups across
   * every finding sharing the same (type, value) - each row here already represents exactly one
   * Location (see {@code FindingSpecification#sameTypeValueDifferentLocation}), so only that single
   * finding's own assets/location are relevant.
   */
  public FindingSiblingOutput toFindingSiblingOutput(
      Finding finding, FindingTriageStatus triageStatus, boolean archived) {
    return FindingSiblingOutput.builder()
        .id(finding.getId())
        .value(finding.getValue())
        .type(finding.getType())
        .creationDate(finding.getCreationDate())
        .updateDate(finding.getUpdateDate())
        .humanUpdateDate(finding.getHumanUpdateDate())
        .archivedAt(finding.getArchivedAt())
        .assets(
            finding.getAssets().stream()
                .map(endpointMapper::toEndpointSimple)
                .collect(Collectors.toSet()))
        .assetGroups(
            finding.getAssets().stream()
                .flatMap(asset -> asset.getAssetGroups().stream())
                .distinct()
                .map(assetGroupMapper::toAssetGroupSimple)
                .collect(Collectors.toSet()))
        .source(
            Optional.ofNullable(finding.getInject())
                .map(Inject::getInjector)
                .map(injectorMapper::toInjectorSimple)
                .orElse(null))
        .findingTriageStatus(triageStatus)
        .severity(finding.getSeverity())
        .resource(finding.getResource())
        .cloudAccount(finding.getCloudAccount())
        .cloudProvider(finding.getCloudProvider())
        .cloudRegion(finding.getCloudRegion())
        .remediation(finding.getRemediation())
        .compliance(finding.getCompliance())
        .location(
            Optional.ofNullable(finding.getLocationAsset())
                .map(endpointMapper::toEndpointSimple)
                .orElse(null))
        .archived(archived)
        .build();
  }
}
