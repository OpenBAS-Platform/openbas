import type { Scenario, SearchPaginationInput } from '../../utils/api-types';
import { simplePostCall } from '../../utils/Action';
import { EXERCISE_URI } from './exercise-action';

// eslint-disable-next-line import/prefer-default-export
export const searchExerciseTeams = (exerciseId: Scenario['scenario_id'], paginationInput: SearchPaginationInput) => {
  const uri = `${EXERCISE_URI}/${exerciseId}/teams/search`;
  return simplePostCall(uri, paginationInput);
};
