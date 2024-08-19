import { simpleCall } from '../../utils/Action';

// eslint-disable-next-line import/prefer-default-export
export const searchExerciseInjectTests = (exerciseId: string) => {
  const uri = `/api/exercise/${exerciseId}/injects/test`;
  return simpleCall(uri);
};

export const searchScenarioInjectTests = (scenarioId: string) => {
  const uri = `/api/scenario/${scenarioId}/injects/test`;
  return simpleCall(uri);
};

export const fetchInjectTestStatus = (testId: string | undefined) => {
  const uri = `/api/injects/test/${testId}`;
  return simpleCall(uri);
};
