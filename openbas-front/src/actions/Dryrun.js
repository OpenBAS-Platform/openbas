import { delReferential, getReferential, postReferential } from '../utils/Action';
import * as schema from './Schema';

export const fetchDryruns = exerciseId => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/dryruns`;
  return getReferential(schema.arrayOfDryruns, uri)(dispatch);
};

export const fetchDryrun = (exerciseId, dryrunId) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/dryruns/${dryrunId}`;
  return getReferential(schema.dryrun, uri)(dispatch);
};

export const addDryrun = (exerciseId, data) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/dryruns`;
  return postReferential(schema.dryrun, uri, data)(dispatch);
};

export const deleteDryrun = (exerciseId, dryrunId) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/dryruns/${dryrunId}`;
  return delReferential(uri, 'dryruns', dryrunId)(dispatch);
};
