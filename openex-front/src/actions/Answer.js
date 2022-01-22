import * as schema from './Schema';
import {
  getReferential,
  putReferential,
  postReferential,
  delReferential,
} from '../utils/Action';

export const fetchAnswers = (exerciseId, pollId) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/polls/${pollId}/evalutions`;
  return getReferential(schema.arrayOfAnswers, uri)(dispatch);
};

export const updateAnswer = (exerciseId, pollId, answerId, data) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/polls/${pollId}/answers/${answerId}`;
  return putReferential(schema.answer, uri, data)(dispatch);
};

export const addAnswer = (exerciseId, pollId, data) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/polls/${pollId}/answers`;
  return postReferential(schema.answer, uri, data)(dispatch);
};

export const deleteAnswer = (exerciseId, pollId, answerId) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/polls/${pollId}/answer/${answerId}`;
  return delReferential(uri, 'answers', answerId)(dispatch);
};
