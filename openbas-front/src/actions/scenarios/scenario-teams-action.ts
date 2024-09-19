import type { Scenario, SearchPaginationInput } from '../../utils/api-types';
import { simplePostCall } from '../../utils/Action';
import { SCENARIO_URI } from './scenario-actions';

// eslint-disable-next-line import/prefer-default-export
export const searchScenarioTeams = (scenarioId: Scenario['scenario_id'], paginationInput: SearchPaginationInput) => {
  const uri = `${SCENARIO_URI}/${scenarioId}/teams/search`;
  return simplePostCall(uri, paginationInput);
};
