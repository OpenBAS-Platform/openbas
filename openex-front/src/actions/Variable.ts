import { Dispatch } from 'redux';
import * as schema from './Schema';
import {
  getReferential,
  putReferential,
  postReferential,
  delReferential,
} from '../utils/Action';
import type { Exercise, Variable, VariableInput } from '../utils/api-types';

export const addVariable = (exerciseId: Exercise['exercise_id'], data: VariableInput) => (dispatch: Dispatch) => {
  const uri = `/api/exercises/${exerciseId}/variables`;
  return postReferential(schema.variable, uri, data)(dispatch);
};

export const updateVariable = (
  exerciseId: Exercise['exercise_id'],
  variableId: Variable['variable_id'],
  data: VariableInput,
) => (dispatch: Dispatch) => {
  const uri = `/api/exercises/${exerciseId}/variables/${variableId}`;
  return putReferential(schema.variable, uri, data)(dispatch);
};

export const deleteVariable = (exerciseId: Exercise['exercise_id'], variableId: Variable['variable_id']) => (dispatch: Dispatch) => {
  const uri = `/api/exercises/${exerciseId}/variables/${variableId}`;
  return delReferential(uri, 'variables', variableId)(dispatch);
};

export const fetchVariables = (exerciseId: Exercise['exercise_id']) => (dispatch: Dispatch) => {
  const uri = `/api/exercises/${exerciseId}/variables`;
  return getReferential(schema.arrayOfVariables, uri)(dispatch);
};

export interface VariablesHelper {
  getExerciseVariables: (exerciseId: Exercise['exercise_id']) => [Variable];
}
