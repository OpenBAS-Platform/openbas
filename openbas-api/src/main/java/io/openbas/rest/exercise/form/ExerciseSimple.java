package io.openbas.rest.exercise.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openbas.database.model.Exercise;
import io.openbas.database.model.Tag;
import io.openbas.helper.MultiIdListDeserializer;
import io.openbas.rest.atomic_testing.form.InjectTargetWithResult;
import io.openbas.utils.AtomicTestingMapper;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.BeanUtils;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static io.openbas.utils.ResultUtils.computeGlobalExpectationResults;
import static io.openbas.utils.ResultUtils.computeTargetResults;

@Setter
@Getter
public class ExerciseSimple {

  @JsonProperty("exercise_id")
  @NotBlank
  private String id;

  @JsonProperty("exercise_name")
  @NotBlank
  private String name;

  @JsonProperty("exercise_status")
  @Enumerated(EnumType.STRING)
  private Exercise.STATUS status;

  @JsonProperty("exercise_subtitle")
  private String subtitle;

  @JsonProperty("exercise_category")
  private String category;

  @JsonProperty("exercise_start_date")
  private Instant start;

  @JsonSerialize(using = MultiIdListDeserializer.class)
  @JsonProperty("exercise_tags")
  private Set<Tag> tags = new HashSet<>();

  @JsonProperty("exercise_global_score")
  private List<AtomicTestingMapper.ExpectationResultsByType> expectationResultByTypes = new ArrayList<>();

  @JsonProperty("exercise_targets")
  @NotNull
  private List<InjectTargetWithResult> targets;

  public static ExerciseSimple fromExercise(Exercise exercise) {
    ExerciseSimple simple = new ExerciseSimple();
    BeanUtils.copyProperties(exercise, simple);
    simple.setStart(exercise.getStart().orElse(null));
    simple.setExpectationResultByTypes(computeGlobalExpectationResults(exercise.getInjects()));
    simple.setTargets(computeTargetResults(exercise.getInjects()));
    return simple;
  }

}
