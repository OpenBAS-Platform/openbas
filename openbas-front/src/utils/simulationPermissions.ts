import * as R from 'ramda';
import { useContext } from 'react';

import { type ExercisesHelper } from '../../actions/exercises/exercise-helper';
import { type LoggedHelper, type UserHelper } from '../../actions/helper';
import { useHelper } from '../../store';
import { type Exercise } from '../api-types';
import { AbilityContext } from './PermissionsProvider';
import { ACTIONS, SUBJECTS } from './types';

const useSimulationPermissions = (exerciseId: string, fullExercise?: Exercise) => {
  const ability = useContext(AbilityContext);

  const { exercise, me, logged } = useHelper((helper: ExercisesHelper & UserHelper & LoggedHelper) => {
    return {
      exercise: helper.getExercise(exerciseId),
      me: helper.getMe(),
      logged: helper.logged(),
    };
  });

  if ((!fullExercise && !exercise) || !me) {
    return {
      canAccess: false,
      canManage: false,
      canLaunch: false,
      readOnly: true,
      isLoggedIn: !R.isEmpty(logged),
      isRunning: false,
    };
  }

  const canAccess = ability.can(ACTIONS.ACCESS, SUBJECTS.RESOURCE, exerciseId) || ability.can(ACTIONS.ACCESS, SUBJECTS.ASSESSMENT);
  const canManage = ability.can(ACTIONS.MANAGE, SUBJECTS.RESOURCE, exerciseId) || ability.can(ACTIONS.MANAGE, SUBJECTS.ASSESSMENT);
  const canLaunch = ability.can(ACTIONS.LAUNCH, SUBJECTS.RESOURCE, exerciseId) || ability.can(ACTIONS.LAUNCH, SUBJECTS.ASSESSMENT);
  const isRunning = (exercise || fullExercise).exercise_status === 'RUNNING';
  const readOnly = exercise.exercise_status === 'FINISHED' || exercise.exercise_status === 'CANCELED' || !canManage;

  return {
    canAccess,
    canManage,
    canLaunch,
    readOnly,
    isLoggedIn: !R.isEmpty(logged),
    isRunning,
  };
};

export default useSimulationPermissions;

export const secondsFromToNow = (date: Date) => {
  if (!date) {
    return 0;
  }
  const timestamp = Math.floor(new Date(date).getTime() / 1000);
  const now = Math.floor(Date.now() / 1000);
  return now - timestamp;
};

// todo : isExerciseUpdatable -> transform in canManage
// todo : isExerciseReadOnly transforme in readOnly
