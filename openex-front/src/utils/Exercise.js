export const isExerciseReadOnly = (exercise) => exercise.exercise_status === 'FINISHED'
  || exercise.exercise_status === 'CANCELED'
  || exercise.user_can_update === false;

export const isExerciseUpdatable = (exercise) => !isExerciseReadOnly(exercise);
