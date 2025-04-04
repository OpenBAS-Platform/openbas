package io.openbas.utils;

import io.openbas.database.model.Finding;
import io.openbas.rest.finding.form.FindingOutput;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.stereotype.Component;

@RequiredArgsConstructor
@Component
@Log
public class FindingMapper {

  private final EndpointMapper endpointMapper;
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
        // .endpoints(finding.getAssets().stream().map(asset->endpointMapper.toEndpointOutput(asset).collect(Collectors.toSet()))
        .inject(injectMapper.toInjectSimple(finding.getInject()))
        .simulation(exerciseMapper.toExerciseSimple(finding.getInject().getExercise()))
        .scenario(scenarioMapper.toScenarioSimple(finding.getInject().getScenario()))
        .tagIds(finding.getTags().stream().map(tag -> tag.getId()).collect(Collectors.toSet()))
        .creationDate(finding.getCreationDate())
        .build();
  }
}
