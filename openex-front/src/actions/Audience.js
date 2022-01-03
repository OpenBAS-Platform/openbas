import * as schema from './Schema';
import {
  getReferential,
  putReferential,
  postReferential,
  delReferential,
} from '../utils/Action';

export const fetchAudiences = (exerciseId) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/audiences`;
  return getReferential(schema.arrayOfAudiences, uri)(dispatch);
};

export const fetchAudiencePlayers = (exerciseId, audienceId) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/audiences/${audienceId}/players`;
  return getReferential(schema.arrayOfUsers, uri)(dispatch);
};

export const fetchAudience = (exerciseId, audienceId) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/audiences/${audienceId}`;
  return getReferential(schema.audience, uri)(dispatch);
};

export const updateAudience = (exerciseId, audienceId, data) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/audiences/${audienceId}`;
  return putReferential(schema.audience, uri, data)(dispatch);
};

export const updateAudienceActivation = (exerciseId, audienceId, data) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/audiences/${audienceId}/activation`;
  return putReferential(schema.audience, uri, data)(dispatch);
};

export const updateAudiencePlayers = (exerciseId, audienceId, data) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/audiences/${audienceId}/players`;
  return putReferential(schema.audience, uri, data)(dispatch);
};

export const addAudience = (exerciseId, data) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/audiences`;
  return postReferential(schema.audience, uri, data)(dispatch);
};

export const deleteAudience = (exerciseId, audienceId) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/audiences/${audienceId}`;
  return delReferential(uri, 'audiences', audienceId)(dispatch);
};

export const copyAudienceToExercise = (exerciseId, audienceId, data) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/copy-audience/${audienceId}`;
  return putReferential(schema.audience, uri, data)(dispatch);
};
