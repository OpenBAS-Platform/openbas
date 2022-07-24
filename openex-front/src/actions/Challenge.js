import { schema } from 'normalizr';
import {
  delReferential,
  getReferential,
  postReferential,
  putReferential,
} from '../utils/Action';

const challenge = new schema.Entity('challenges', {}, { idAttribute: 'challenge_id' });
const arrayOfChallenges = new schema.Array(challenge);
export const fetchChallenges = () => (dispatch) => {
  const uri = '/api/challenges';
  return getReferential(arrayOfChallenges, uri)(dispatch);
};
export const fetchChallenge = (challengeId) => (dispatch) => {
  const uri = `/api/challenges/${challengeId}`;
  return getReferential(challengeId, uri)(dispatch);
};
export const updateChallenge = (challengeId, data) => (dispatch) => {
  const uri = `/api/challenges/${challengeId}`;
  return putReferential(challengeId, uri, data)(dispatch);
};
export const addChallenge = (data) => (dispatch) => postReferential(challenge, '/api/challenges', data)(dispatch);
export const deleteChallenge = (mediaId) => (dispatch) => {
  const uri = `/api/challenges/${mediaId}`;
  return delReferential(uri, 'challenges', mediaId)(dispatch);
};
