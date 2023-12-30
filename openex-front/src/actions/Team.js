import * as schema from './Schema';
import { getReferential, putReferential, postReferential, delReferential } from '../utils/Action';

export const fetchTeams = () => (dispatch) => {
  const uri = '/api/teams';
  return getReferential(schema.arrayOfTeams, uri)(dispatch);
};

export const fetchExerciseTeams = (exerciseId) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/teams`;
  return getReferential(schema.arrayOfTeams, uri)(dispatch);
};

export const fetchTeamPlayers = (exerciseId, teamId) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/teams/${teamId}/players`;
  return getReferential(schema.arrayOfUsers, uri)(dispatch);
};

export const fetchTeam = (exerciseId, teamId) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/teams/${teamId}`;
  return getReferential(schema.team, uri)(dispatch);
};

export const updateTeam = (teamId, data) => (dispatch) => {
  const uri = `/api/teams/${teamId}`;
  return putReferential(schema.team, uri, data)(dispatch);
};

export const updateTeamActivation = (exerciseId, teamId, data) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/teams/${teamId}/activation`;
  return putReferential(schema.team, uri, data)(dispatch);
};

export const updateTeamPlayers = (exerciseId, teamId, data) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/teams/${teamId}/players`;
  return putReferential(schema.team, uri, data)(dispatch);
};

export const addTeam = (data) => (dispatch) => {
  const uri = '/api/teams';
  return postReferential(schema.team, uri, data)(dispatch);
};

export const deleteTeam = (teamId) => (dispatch) => {
  const uri = `/api/teams/${teamId}`;
  return delReferential(uri, 'teams', teamId)(dispatch);
};

export const copyTeamToExercise = (exerciseId, teamId, data) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/copy-team/${teamId}`;
  return putReferential(schema.team, uri, data)(dispatch);
};
