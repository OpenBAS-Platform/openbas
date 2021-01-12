import * as schema from './Schema';
import {
  getReferential,
  putReferential,
  postReferential,
  delReferential,
} from '../utils/Action';

export const fetchObjectives = (exerciseId) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/objectives`;
  return getReferential(schema.arrayOfObjectives, uri)(dispatch);
};

export const fetchObjective = (exerciseId, objectiveId) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/objectives/${objectiveId}`;
  return getReferential(schema.objective, uri)(dispatch);
};

export const updateObjective = (exerciseId, objectiveId, data) => (
  dispatch,
) => {
  const uri = `/api/exercises/${exerciseId}/objectives/${objectiveId}`;
  return putReferential(schema.objective, uri, data)(dispatch);
};

export const addObjective = (exerciseId, data) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/objectives`;
  return postReferential(schema.objective, uri, data)(dispatch);
};

export const deleteObjective = (exerciseId, objectiveId) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/objectives/${objectiveId}`;
  return delReferential(uri, 'objectives', objectiveId)(dispatch);
};
