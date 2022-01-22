import * as schema from './Schema';
import {
  getReferential,
  putReferential,
  postReferential,
  delReferential,
} from '../utils/Action';

export const fetchPolls = (exerciseId) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/polls`;
  return getReferential(schema.arrayOfPolls, uri)(dispatch);
};

export const fetchPoll = (exerciseId, pollId) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/polls/${pollId}`;
  return getReferential(schema.poll, uri)(dispatch);
};

export const updatePoll = (exerciseId, pollId, data) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/polls/${pollId}`;
  return putReferential(schema.poll, uri, data)(dispatch);
};

export const addPoll = (exerciseId, data) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/polls`;
  return postReferential(schema.poll, uri, data)(dispatch);
};

export const deletePoll = (exerciseId, pollId) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/polls/${pollId}`;
  return delReferential(uri, 'polls', pollId)(dispatch);
};
