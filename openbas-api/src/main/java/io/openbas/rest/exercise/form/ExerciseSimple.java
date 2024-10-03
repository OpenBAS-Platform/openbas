package io.openbas.rest.exercise.form;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.openbas.database.model.Exercise;
import io.openbas.database.model.ExerciseStatus;
import io.openbas.database.model.Inject;
import io.openbas.database.model.Tag;
import io.openbas.database.raw.RawExercise;
import io.openbas.database.repository.InjectExpectationRepository;
import io.openbas.database.repository.InjectRepository;
import io.openbas.helper.MultiIdSetDeserializer;
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
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static io.openbas.utils.ResultUtils.*;
import static java.time.Instant.now;

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
  private ExerciseStatus status;

  @JsonProperty("exercise_subtitle")
  private String subtitle;

  @JsonProperty("exercise_category")
  private String category;

  @JsonProperty("exercise_start_date")
  private Instant start;

  @JsonProperty("exercise_updated_at")
  private Instant updatedAt = now();

  @JsonSerialize(using = MultiIdSetDeserializer.class)
  @JsonProperty("exercise_tags")
  private Set<Tag> tags = new HashSet<>();

  @JsonIgnore
  private String[] injectIds;

  @JsonProperty("exercise_global_score")
  private List<AtomicTestingMapper.ExpectationResultsByType> expectationResultByTypes = new ArrayList<>();

  @JsonProperty("exercise_targets")
  @NotNull
  private List<InjectTargetWithResult> targets;

  public static ExerciseSimple fromExercise(Exercise exercise, InjectRepository injectRepository, InjectExpectationRepository injectExpectationRepository) {
    ExerciseSimple simple = new ExerciseSimple();
    BeanUtils.copyProperties(exercise, simple);
    simple.setStart(exercise.getStart().orElse(null));
    simple.setUpdatedAt(exercise.getUpdatedAt());
    simple.setExpectationResultByTypes(
        computeGlobalExpectationResults_raw(
            injectExpectationRepository.rawForComputeGlobalByIds(
                exercise.getInjects().stream().map(Inject::getId).toList())));
    simple.setTargets(computeTargetResultsWithRawExercise(exercise.getInjects(), injectRepository, injectExpectationRepository));
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
      ).collect(Collectors.toSet()));
    } else {
      simple.setTags(new HashSet<>());
    }
    simple.setCategory(exercise.getExercise_category());
    simple.setSubtitle(exercise.getExercise_subtitle());
    simple.setStatus(ExerciseStatus.valueOf(exercise.getExercise_status()));
    simple.setStart(exercise.getExercise_start_date());
    simple.setUpdatedAt(exercise.getExercise_updated_at());

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
