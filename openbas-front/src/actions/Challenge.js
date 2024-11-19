import { schema } from 'normalizr';

import { delReferential, getReferential, postReferential, putReferential } from '../utils/Action';
import { challengesReader } from './Schema';

const challenge = new schema.Entity(
  'challenges',
  {},
  { idAttribute: 'challenge_id' },
);
const arrayOfChallenges = new schema.Array(challenge);

export const fetchChallenges = () => (dispatch) => {
  const uri = '/api/challenges';
  return getReferential(arrayOfChallenges, uri)(dispatch);
};

export const fetchExerciseChallenges = exerciseId => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/challenges`;
  return getReferential(arrayOfChallenges, uri)(dispatch);
};

export const fetchChallenge = challengeId => (dispatch) => {
  const uri = `/api/challenges/${challengeId}`;
  return getReferential(challengeId, uri)(dispatch);
};

export const updateChallenge = (challengeId, data) => (dispatch) => {
  const uri = `/api/challenges/${challengeId}`;
  return putReferential(challenge, uri, data)(dispatch);
};

export const addChallenge = data => dispatch => postReferential(challenge, '/api/challenges', data)(dispatch);

export const tryChallenge = (challengeId, data) => dispatch => postReferential(null, `/api/challenges/${challengeId}/try`, data)(dispatch);

export const validateChallenge = (exerciseId, challengeId, userId, data) => dispatch => postReferential(
  challengesReader,
  `/api/player/challenges/${exerciseId}/${challengeId}/validate?userId=${userId}`,
  data,
)(dispatch);

export const deleteChallenge = channelId => (dispatch) => {
  const uri = `/api/challenges/${channelId}`;
  return delReferential(uri, 'challenges', channelId)(dispatch);
};

export const fetchPlayerChallenges = (exerciseId, userId) => (dispatch) => {
  const uri = `/api/player/challenges/${exerciseId}?userId=${userId}`;
  return getReferential(challengesReader, uri)(dispatch);
};

export const fetchObserverChallenges = (exerciseId, userId) => (dispatch) => {
  const uri = `/api/observer/challenges/${exerciseId}?userId=${userId}`;
  return getReferential(challengesReader, uri)(dispatch);
};

// -- SCENARIOS --

export const fetchScenarioChallenges = scenarioId => (dispatch) => {
  const uri = `/api/scenarios/${scenarioId}/challenges`;
  return getReferential(arrayOfChallenges, uri)(dispatch);
};
