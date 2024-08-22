import { simpleCall, simplePostCall } from '../../utils/Action';
import type { Exercise, InjectsImportInput, SearchPaginationInput } from '../../utils/api-types';
import { MESSAGING$ } from '../../utils/Environment';

const EXERCISE_URI = '/api/exercises/';

export const fetchExerciseExpectationResult = (exerciseId: Exercise['exercise_id']) => {
  const uri = `${EXERCISE_URI}${exerciseId}/results`;
  return simpleCall(uri);
};

export const fetchExerciseInjectExpectationResults = (exerciseId: Exercise['exercise_id']) => {
  const uri = `${EXERCISE_URI}${exerciseId}/injects/results`;
  return simpleCall(uri);
};

export const searchExerciseInjects = (exerciseId: Exercise['exercise_id'], searchPaginationInput: SearchPaginationInput) => {
  const data = searchPaginationInput;
  const uri = `${EXERCISE_URI}${exerciseId}/injects/search`;
  return simplePostCall(uri, data);
};

// -- IMPORT --

export const importXlsForExercise = (exerciseId: Exercise['exercise_id'], importId: string, input: InjectsImportInput) => {
  const uri = `${EXERCISE_URI}/${exerciseId}/xls/${importId}/import`;
  return simplePostCall(uri, input)
    .then((response) => {
      const injectCount = response.data.total_injects;
      if (injectCount === 0) {
        MESSAGING$.notifySuccess('No inject imported');
      } else {
        MESSAGING$.notifySuccess(`${injectCount} inject imported`);
      }
      return response;
    });
};

export const dryImportXlsForExercise = (exerciseId: Exercise['exercise_id'], importId: string, input: InjectsImportInput) => {
  const uri = `${EXERCISE_URI}/${exerciseId}/xls/${importId}/dry`;
  return simplePostCall(uri, input)
    .then((response) => {
      return response;
    });
};
