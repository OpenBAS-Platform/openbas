import * as R from 'ramda';

import { useHelper } from '../store';

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

export const usePermissions = (exerciseId, fullExercise = null) => {
  const { exercise, me, logged } = useHelper((helper) => {
    return {
      exercise: helper.getExercise(exerciseId),
      me: helper.getMe(),
      logged: helper.logged(),
    };
  });
  if ((!fullExercise && !exercise) || !me) {
    return {
      canRead: false,
      canWrite: false,
      canPlay: false,
      canReadBypassStatus: false,
      canWriteBypassStatus: false,
      canPlayBypassStatus: false,
      readOnly: true,
      readOnlyBypassStatus: true,
      isLoggedIn: !R.isEmpty(logged),
      isRunning: false,
    };
  }
  const canReadBypassStatus = logged.admin
    || (exercise || fullExercise).exercise_observers?.includes(me.user_id);
  const canRead = logged.admin
    || (exercise || fullExercise).exercise_status === 'FINISHED'
    || (exercise || fullExercise).exercise_status === 'CANCELED'
    || (exercise || fullExercise).exercise_observers?.includes(me.user_id);
  const canWriteBypassStatus = logged.admin
    || (exercise || fullExercise).exercise_planners?.includes(me.user_id);
  const canWrite = logged.admin
    || (exercise || fullExercise).exercise_status === 'FINISHED'
    || (exercise || fullExercise).exercise_status === 'CANCELED'
    || (exercise || fullExercise).exercise_planners?.includes(me.user_id);
  const canPlayBypassStatus = logged.admin
    || (exercise || fullExercise).exercise_users?.includes(me.user_id);
  const canPlay = logged.admin
    || (exercise || fullExercise).exercise_status === 'FINISHED'
    || (exercise || fullExercise).exercise_status === 'CANCELED'
    || (exercise || fullExercise).exercise_users?.includes(me.user_id);
  const isRunning = (exercise || fullExercise).exercise_status === 'RUNNING';
  return {
    canRead,
    canWrite,
    canPlay,
    canReadBypassStatus,
    canWriteBypassStatus,
    canPlayBypassStatus,
    readOnly: !canWrite,
    readOnlyBypassStatus: !canWriteBypassStatus,
    isLoggedIn: !R.isEmpty(logged),
    isRunning,
  };
};

export const secondsFromToNow = (date) => {
  if (!date) {
    return 0;
  }
  const timestamp = Math.floor(new Date(date).getTime() / 1000);
  const now = Math.floor(Date.now() / 1000);
  return now - timestamp;
};
