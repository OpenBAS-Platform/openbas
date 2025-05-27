package io.openbas.rest.exercise.response;

import io.openbas.database.model.Exercise;
import io.openbas.rest.challenge.output.PublicEntity;
import lombok.Getter;

@Getter
public class PublicExercise extends PublicEntity {

  public PublicExercise(Exercise exercise) {
    setId(exercise.getId());
    setName(exercise.getName());
    setDescription(exercise.getDescription());
  }
}
