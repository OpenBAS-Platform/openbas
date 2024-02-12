import { Dispatch } from 'redux';
import * as schema from './../Schema';
import { getReferential, putReferential, postReferential, delReferential } from '../../utils/Action';
import type { Exercise, Variable, VariableInput } from '../../utils/api-types';
import { ScenarioStore } from '../scenarios/Scenario';


// -- EXERCISES --

export const addVariableForExercise = (exerciseId: Exercise['exercise_id'], data: VariableInput) => (dispatch: Dispatch) => {
  const uri = `/api/exercises/${exerciseId}/variables`;
  return postReferential(schema.variable, uri, data)(dispatch);
};

export const updateVariableForExercise = (
  exerciseId: Exercise['exercise_id'],
  variableId: Variable['variable_id'],
  data: VariableInput,
) => (dispatch: Dispatch) => {
  const uri = `/api/exercises/${exerciseId}/variables/${variableId}`;
  return putReferential(schema.variable, uri, data)(dispatch);
};

export const deleteVariableForExercise = (exerciseId: Exercise['exercise_id'], variableId: Variable['variable_id']) => (dispatch: Dispatch) => {
  const uri = `/api/exercises/${exerciseId}/variables/${variableId}`;
  return delReferential(uri, 'variables', variableId)(dispatch);
};

export const fetchVariablesForExercise = (exerciseId: Exercise['exercise_id']) => (dispatch: Dispatch) => {
  const uri = `/api/exercises/${exerciseId}/variables`;
  return getReferential(schema.arrayOfVariables, uri)(dispatch);
};

// -- SCENARIOS --

export const addVariableForScenario = (scenarioId: ScenarioStore['scenario_id'], data: VariableInput) => (dispatch: Dispatch) => {
  const uri = `/api/scenarios/${scenarioId}/variables`;
  return postReferential(schema.variable, uri, data)(dispatch);
};

export const updateVariableForScenario = (
  scenarioId: ScenarioStore['scenario_id'],
  variableId: Variable['variable_id'],
  data: VariableInput,
) => (dispatch: Dispatch) => {
  const uri = `/api/scenarios/${scenarioId}/variables/${variableId}`;
  return putReferential(schema.variable, uri, data)(dispatch);
};

export const deleteVariableForScenario = (scenarioId: ScenarioStore['scenario_id'], variableId: Variable['variable_id']) => (dispatch: Dispatch) => {
  const uri = `/api/scenarios/${scenarioId}/variables/${variableId}`;
  return delReferential(uri, 'variables', variableId)(dispatch);
};

export const fetchVariablesForScenario = (scenarioId: ScenarioStore['scenario_id']) => (dispatch: Dispatch) => {
  const uri = `/api/scenarios/${scenarioId}/variables`;
  return getReferential(schema.arrayOfVariables, uri)(dispatch);
};
