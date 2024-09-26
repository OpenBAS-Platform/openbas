import { Dispatch } from 'redux';
import type { ExerciseUpdateTeamsInput, Scenario, SearchPaginationInput } from '../../utils/api-types';
import { putReferential, simplePostCall } from '../../utils/Action';
import { EXERCISE_URI } from './exercise-action';
import * as schema from '../Schema';

// eslint-disable-next-line import/prefer-default-export
export const searchExerciseTeams = (exerciseId: Scenario['scenario_id'], paginationInput: SearchPaginationInput) => {
  const uri = `${EXERCISE_URI}/${exerciseId}/teams/search`;
  return simplePostCall(uri, paginationInput);
};

export const addExerciseTeams = (exerciseId: Scenario['scenario_id'], data: ExerciseUpdateTeamsInput) => (dispatch: Dispatch) => putReferential(
  schema.arrayOfTeams,
  `${EXERCISE_URI}/${exerciseId}/teams/add`,
  data,
)(dispatch);

export const removeExerciseTeams = (exerciseId: Scenario['scenario_id'], data: ExerciseUpdateTeamsInput) => (dispatch: Dispatch) => putReferential(
  schema.arrayOfTeams,
  `${EXERCISE_URI}/${exerciseId}/teams/remove`,
  data,
)(dispatch);

export const replaceExerciseTeams = (exerciseId: Scenario['scenario_id'], data: ExerciseUpdateTeamsInput) => (dispatch: Dispatch) => putReferential(
  schema.arrayOfTeams,
  `${EXERCISE_URI}/${exerciseId}/teams/replace`,
  data,
)(dispatch);
