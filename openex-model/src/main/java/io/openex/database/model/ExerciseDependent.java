package io.openex.database.model;

public interface ExerciseDependent extends Base {

  Exercise getExercise();

  void setExercise(Exercise exercise);

}
