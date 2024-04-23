package io.openbas.rest.exercise.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openbas.atomic_testing.AtomicTestingMapper;
import io.openbas.database.model.AttackPattern;
import io.openbas.database.model.Inject;
import io.openbas.helper.MonoIdDeserializer;
import lombok.Data;

import java.util.List;

@Data
public class ExerciseInjectExpectationResultsByType {

  @JsonProperty("exercise_inject_results_results")
  private List<InjectExpectationResultsByType> results;

  @JsonSerialize(using = MonoIdDeserializer.class)
  @JsonProperty("exercise_inject_results_attack_pattern")
  private AttackPattern attackPattern;

  @Data
  public static class InjectExpectationResultsByType {

    @JsonSerialize(using = MonoIdDeserializer.class)
    @JsonProperty("inject")
    private Inject inject;

    @JsonProperty("results")
    private List<AtomicTestingMapper.ExpectationResultsByType> results;
  }

}
