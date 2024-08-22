import { simpleCall, simplePostCall } from '../../utils/Action';
import type { SearchPaginationInput } from '../../utils/api-types';

// eslint-disable-next-line import/prefer-default-export
export const searchExerciseInjectTests = (exerciseId: string, searchPaginationInput: SearchPaginationInput) => {
  const uri = `/api/exercise/${exerciseId}/injects/test`;
  return simplePostCall(uri, searchPaginationInput);
};

export const searchScenarioInjectTests = (scenarioId: string) => {
  const uri = `/api/scenario/${scenarioId}/injects/test`;
  return simpleCall(uri);
};

export const fetchInjectTestStatus = (testId: string | undefined) => {
  const uri = `/api/injects/test/${testId}`;
  return simpleCall(uri);
};
