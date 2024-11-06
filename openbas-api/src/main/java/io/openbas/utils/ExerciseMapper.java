package io.openbas.utils;

import io.openbas.database.model.ExerciseStatus;
import io.openbas.database.model.Tag;
import io.openbas.database.raw.RawExerciseSimple;
import io.openbas.rest.exercise.form.ExerciseSimple;
import java.util.HashSet;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@RequiredArgsConstructor
@Component
public class ExerciseMapper {

  public ExerciseSimple fromRawExerciseSimple(RawExerciseSimple rawExercise) {
    ExerciseSimple simple = new ExerciseSimple();
    simple.setId(rawExercise.getExercise_id());
    simple.setName(rawExercise.getExercise_name());
    if (rawExercise.getExercise_tags() != null) {
      simple.setTags(
          rawExercise.getExercise_tags().stream()
              .map(
                  (tagId) -> {
                    Tag tag = new Tag();
                    tag.setId(tagId);
                    return tag;
                  })
              .collect(Collectors.toSet()));
    } else {
      simple.setTags(new HashSet<>());
    }
    simple.setCategory(rawExercise.getExercise_category());
    simple.setSubtitle(rawExercise.getExercise_subtitle());
    simple.setStatus(ExerciseStatus.valueOf(rawExercise.getExercise_status()));
    simple.setStart(rawExercise.getExercise_start_date());
    simple.setUpdatedAt(rawExercise.getExercise_updated_at());

    return simple;
  }
}
