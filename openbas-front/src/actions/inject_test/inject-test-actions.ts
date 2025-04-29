import { simpleCall, simpleDelCall, simplePostCall } from '../../utils/Action';
import { type SearchPaginationInput } from '../../utils/api-types';

export const searchExerciseInjectTests = (exerciseId: string, searchPaginationInput: SearchPaginationInput) => {
  const uri = `/api/exercises/${exerciseId}/injects/test`;
  return simplePostCall(uri, searchPaginationInput);
};

export const searchScenarioInjectTests = (scenarioId: string, searchPaginationInput: SearchPaginationInput) => {
  const uri = `/api/scenarios/${scenarioId}/injects/test`;
  return simplePostCall(uri, searchPaginationInput);
};

export const fetchInjectTestStatus = (testId: string | undefined) => {
  const uri = `/api/injects/test/${testId}`;
  return simpleCall(uri);
};

export const deleteInjectTest = (testId: string | undefined) => {
  const uri = `/api/injects/test/${testId}`;
  return simpleDelCall(uri);
};
