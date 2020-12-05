import * as schema from './Schema';
// eslint-disable-next-line import/no-cycle
import {
  getReferential,
  putReferential,
  postReferential,
  delReferential,
} from '../utils/Action';

export const fetchLogs = (exerciseId, noloading) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/logs`;
  return getReferential(schema.arrayOfLogs, uri, noloading)(dispatch);
};

export const fetchLog = (exerciseId, logId) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/logs/${logId}`;
  return getReferential(schema.log, uri)(dispatch);
};

export const updateLog = (exerciseId, logId, data) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/logs/${logId}`;
  return putReferential(schema.log, uri, data)(dispatch);
};

export const addLog = (exerciseId, data) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/logs`;
  return postReferential(schema.log, uri, data)(dispatch);
};

export const deleteLog = (exerciseId, logId) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/logs/${logId}`;
  return delReferential(uri, 'logs', logId)(dispatch);
};
