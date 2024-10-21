import { Dispatch } from 'redux';
import type { Scenario, ScenarioUpdateTeamsInput, SearchPaginationInput } from '../../utils/api-types';
import { putReferential, simplePostCall } from '../../utils/Action';
import { SCENARIO_URI } from './scenario-actions';
import * as schema from '../Schema';

export const searchScenarioTeams = (scenarioId: Scenario['scenario_id'], paginationInput: SearchPaginationInput, contextualOnly: boolean = false) => {
  const uri = `${SCENARIO_URI}/${scenarioId}/teams/search?contextualOnly=${contextualOnly}`;
  return simplePostCall(uri, paginationInput);
};

export const addScenarioTeams = (scenarioId: Scenario['scenario_id'], data: ScenarioUpdateTeamsInput) => (dispatch: Dispatch) => putReferential(
  schema.arrayOfTeams,
  `${SCENARIO_URI}/${scenarioId}/teams/add`,
  data,
)(dispatch);

export const removeScenarioTeams = (scenarioId: Scenario['scenario_id'], data: ScenarioUpdateTeamsInput) => (dispatch: Dispatch) => putReferential(
  schema.arrayOfTeams,
  `${SCENARIO_URI}/${scenarioId}/teams/remove`,
  data,
)(dispatch);

export const replaceScenarioTeams = (scenarioId: Scenario['scenario_id'], data: ScenarioUpdateTeamsInput) => (dispatch: Dispatch) => putReferential(
  schema.arrayOfTeams,
  `${SCENARIO_URI}/${scenarioId}/teams/replace`,
  data,
)(dispatch);
