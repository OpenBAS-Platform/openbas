import { simpleCall } from '../../utils/Action';

const INJECT_TEST_URI = '/api/inject_test_status';

// eslint-disable-next-line import/prefer-default-export
export const searchExerciseInjectTests = (exerciseId: string) => {
  const uri = `${INJECT_TEST_URI}/exercise/${exerciseId}`;
  return simpleCall(uri);
};

export const searchScenarioInjectTests = (scenarioId: string) => {
  const uri = `${INJECT_TEST_URI}/scenario/${scenarioId}`;
  return simpleCall(uri);
};
