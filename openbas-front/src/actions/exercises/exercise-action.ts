import { simpleCall } from '../../utils/Action';

const EXERCISE_URI = '/api/exercises/';

export const fetchExerciseExpectationResult = (exerciseId: string) => {
  const uri = `${EXERCISE_URI}${exerciseId}/results`;
  return simpleCall(uri);
};

export const fetchExerciseInjectExpectationResults = (exerciseId: string) => {
  const uri = `${EXERCISE_URI}${exerciseId}/injects/results`;
  return simpleCall(uri);
};
