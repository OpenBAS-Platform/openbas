import { Dispatch } from 'redux';

import { putReferential, simplePostCall } from '../../utils/Action';
import type { ExerciseUpdateTeamsInput, Scenario, SearchPaginationInput } from '../../utils/api-types';
import * as schema from '../Schema';
import { EXERCISE_URI } from './exercise-action';

export const searchExerciseTeams = (exerciseId: Scenario['scenario_id'], paginationInput: SearchPaginationInput, contextualOnly: boolean = false) => {
  const uri = `${EXERCISE_URI}/${exerciseId}/teams/search?contextualOnly=${contextualOnly}`;
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
