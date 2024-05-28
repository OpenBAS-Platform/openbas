package io.openbas.rest.exercise.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openbas.database.model.Exercise;
import io.openbas.database.model.Inject;
import io.openbas.database.model.Tag;
import io.openbas.database.raw.RawExercise;
import io.openbas.helper.MultiIdDeserializer;
import io.openbas.rest.atomic_testing.form.InjectTargetWithResult;
import io.openbas.utils.AtomicTestingMapper;
import io.openbas.utils.AtomicTestingUtils;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.BeanUtils;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

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

  @JsonSerialize(using = MultiIdDeserializer.class)
  @JsonProperty("exercise_tags")
  private List<Tag> tags = new ArrayList<>();

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

  /**
   * Create a classic Exercise object from a Raw one
   * @param exercise the raw exercise
   * @param injects the list of Injects linked to that exercise
   * @return an Exercise Simple object
   */
  public static ExerciseSimple fromRawExercise(RawExercise exercise, List<Inject> injects) {
    ExerciseSimple simple = new ExerciseSimple();
    simple.setId(exercise.getExercise_id());
    simple.setName(exercise.getExercise_name());
    if(exercise.getExercise_tags() != null) {
      simple.setTags(exercise.getExercise_tags().stream().map((tagId) -> {
          Tag tag = new Tag();
          tag.setId(tagId);
          return tag;
        }
      ).collect(Collectors.toList()));
    } else {
      simple.setTags(new ArrayList<>());
    }
    simple.setCategory(exercise.getExercise_category());
    simple.setSubtitle(exercise.getExercise_subtitle());
    simple.setStatus(Exercise.STATUS.valueOf(exercise.getExercise_status()));
    simple.setStart(exercise.getExercise_start_date());

    // We set the ExpectationResults
    simple.setExpectationResultByTypes(AtomicTestingUtils
            .getExpectationResultByTypes(injects.stream().flatMap(inject -> inject.getExpectations().stream()).toList()));
    if(injects != null) {
      simple.setTargets(computeTargetResults(injects));
    } else {
      simple.setTargets(new ArrayList<>());
    }
    return simple;
  }

}
