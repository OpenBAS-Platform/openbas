export const isExerciseReadOnly = (exercise, overrideStatus = false) => {
  if (!exercise) {
    return true;
  }
  if (overrideStatus) {
    return exercise.user_can_update === false;
  }
  return (
    exercise.exercise_status === 'FINISHED'
    || exercise.exercise_status === 'CANCELED'
    || exercise.user_can_update === false
  );
};

export const isExerciseUpdatable = (exercise, overrideStatus = false) => !isExerciseReadOnly(exercise, overrideStatus);
