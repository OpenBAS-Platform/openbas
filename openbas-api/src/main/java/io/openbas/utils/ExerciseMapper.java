package io.openbas.utils;

import io.openbas.database.model.ExerciseStatus;
import io.openbas.database.model.Tag;
import io.openbas.database.raw.RawExercise;
import io.openbas.rest.exercise.form.ExerciseSimple;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Component
public class ExerciseMapper {

  private final ResultUtils resultUtils;


  public ExerciseSimple fromRawExercise(RawExercise rawExercise) {
    ExerciseSimple simple = new ExerciseSimple();
    simple.setId(rawExercise.getExercise_id());
    simple.setName(rawExercise.getExercise_name());
    if (rawExercise.getExercise_tags() != null) {
      simple.setTags(rawExercise.getExercise_tags().stream().map((tagId) -> {
            Tag tag = new Tag();
            tag.setId(tagId);
            return tag;
          }
      ).collect(Collectors.toSet()));
    } else {
      simple.setTags(new HashSet<>());
    }
    simple.setCategory(rawExercise.getExercise_category());
    simple.setSubtitle(rawExercise.getExercise_subtitle());
    simple.setStatus(ExerciseStatus.valueOf(rawExercise.getExercise_status()));
    simple.setStart(rawExercise.getExercise_start_date());
    simple.setUpdatedAt(rawExercise.getExercise_updated_at());
    simple.setTargets(resultUtils.getInjectTargetWithResults(rawExercise.getInject_ids()));
    simple.setExpectationResultByTypes(resultUtils.getResultsByTypes(rawExercise.getInject_ids()));

    return simple;
  }
}
