import { Dispatch } from 'redux';
import { delReferential, getReferential, postReferential } from '../../utils/Action';
import { arrayOfScenarios, scenario } from './scenario-schema';
import { Scenario, ScenarioCreateInput } from '../../utils/api-types';

const SCENARIO_URI = '/api/scenarios';

export const addScenario = (data: ScenarioCreateInput) => (dispatch: Dispatch) => {
  return postReferential(scenario, SCENARIO_URI, data)(dispatch);
};

export const deleteScenario = (scenarioId: Scenario['scenario_id']) => (dispatch: Dispatch) => {
  const uri = `${SCENARIO_URI}/${scenarioId}`;
  return delReferential(uri, scenario.key, scenarioId)(dispatch);
};

export const fetchScenario = (scenarioId: string) => (dispatch: Dispatch) => {
  const uri = `${SCENARIO_URI}/${scenarioId}`;
  return getReferential(scenario, uri)(dispatch);
};

export const fetchScenarios = () => (dispatch: Dispatch) => {
  return getReferential(arrayOfScenarios, SCENARIO_URI)(dispatch);
};
