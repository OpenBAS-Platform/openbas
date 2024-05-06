import { simpleCall, simplePostCall } from '../../utils/Action';
import type { SearchPaginationInput } from '../../utils/api-types';

const EXERCISE_URI = '/api/exercises/';

export const fetchExerciseExpectationResult = (exerciseId: string) => {
  const uri = `${EXERCISE_URI}${exerciseId}/results`;
  return simpleCall(uri);
};

export const fetchExerciseInjectExpectationResults = (exerciseId: string) => {
  const uri = `${EXERCISE_URI}${exerciseId}/injects/results`;
  return simpleCall(uri);
};

export const searchExerciseInjects = (exerciseId: string, searchPaginationInput: SearchPaginationInput) => {
  const data = searchPaginationInput;
  const uri = `${EXERCISE_URI}${exerciseId}/injects/search`;
  return simplePostCall(uri, data);
};
