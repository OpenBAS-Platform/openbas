package io.openbas.utils;

import io.openbas.database.model.Endpoint;
import io.openbas.database.model.Exercise;
import io.openbas.database.model.Finding;
import io.openbas.rest.finding.form.FindingOutput;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@RequiredArgsConstructor
@Component
@Slf4j
public class FindingMapper {

  private final EndpointMapper endpointMapper;
  private final AssetGroupMapper assetGroupMapper;
  private final ExerciseMapper exerciseMapper;
  private final ScenarioMapper scenarioMapper;
  private final InjectMapper injectMapper;

  public FindingOutput toFindingOutput(Finding finding) {
    return FindingOutput.builder()
        .id(finding.getId())
        .field(finding.getField())
        .value(finding.getValue())
        .type(finding.getType())
        .name(finding.getName())
        .endpoints(
            finding.getAssets().stream()
                .filter(asset -> asset instanceof Endpoint)
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
        .tagIds(finding.getTags().stream().map(tag -> tag.getId()).collect(Collectors.toSet()))
        .creationDate(finding.getCreationDate())
        .build();
  }
}
