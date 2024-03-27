import * as schema from './Schema';
import { getReferential, putReferential, postReferential, delReferential, simplePostCall } from '../utils/Action';

export const fetchInjects = (exerciseId) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/injects`;
  return getReferential(schema.arrayOfInjects, uri)(dispatch);
};

export const fetchAtomicTestings = () => (dispatch) => {
  const uri = '/api/injects/atomic_testings';
  return getReferential(schema.arrayOfInjects, uri)(dispatch);
};

export const fetchNextInjects = () => (dispatch) => {
  const uri = '/api/injects/next';
  return getReferential(schema.arrayOfInjects, uri)(dispatch);
};

export const fetchInject = (exerciseId, injectId) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/injects/${injectId}`;
  return getReferential(schema.inject, uri)(dispatch);
};

export const fetchAtomicTesting = (injectId) => (dispatch) => {
  const uri = `/api/injects/atomic_testings/${injectId}`;
  return getReferential(schema.inject, uri)(dispatch);
};

export const fetchExerciseInjects = (exerciseId) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/injects`;
  return getReferential(schema.arrayOfInjects, uri)(dispatch);
};

export const fetchInjectTeams = (exerciseId, injectId) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/injects/${injectId}/teams`;
  return getReferential(schema.arrayOfTeams, uri)(dispatch);
};

export const updateInjectForExercise = (exerciseId, injectId, data) => (dispatch) => {
  const uri = `/api/injects/${exerciseId}/${injectId}`;
  return putReferential(schema.inject, uri, data)(dispatch);
};

export const updateInjectActivationForExercise = (exerciseId, injectId, data) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/injects/${injectId}/activation`;
  return putReferential(schema.inject, uri, data)(dispatch);
};

export const updateInjectTrigger = (exerciseId, injectId, data) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/injects/${injectId}/trigger`;
  return putReferential(schema.inject, uri, data)(dispatch);
};

export const updateInjectTeams = (exerciseId, injectId, data) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/injects/${injectId}/teams`;
  return putReferential(schema.inject, uri, data)(dispatch);
};

export const addInjectForExercise = (exerciseId, data) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/injects`;
  return postReferential(schema.inject, uri, data)(dispatch);
};

export const deleteInjectForExercise = (exerciseId, injectId) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/injects/${injectId}`;
  return delReferential(uri, 'injects', injectId)(dispatch);
};

export const tryInject = (injectId) => (dispatch) => {
  const uri = `/api/injects/try/${injectId}`;
  return getReferential(null, uri, null)(dispatch);
};

export const executeInject = (exerciseId, values, files) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/inject`;
  const formData = new FormData();
  formData.append('file', files && files.length > 0 ? files[0] : null);
  const blob = new Blob([JSON.stringify(values)], { type: 'application/json' });
  formData.append('input', blob);
  return postReferential(schema.injectStatus, uri, formData)(dispatch);
};

export const fetchInjectTypes = () => (dispatch) => getReferential(schema.arrayOfInjectTypes, '/api/inject_types')(dispatch);

export const searchContracts = (searchPaginationInput) => {
  const data = searchPaginationInput;
  const uri = '/api/contracts/search';
  return simplePostCall(uri, data);
};
export const injectDone = (exerciseId, injectId) => (dispatch) => {
  const data = { status: 'SUCCESS', message: 'Manual validation' };
  const uri = `/api/exercises/${exerciseId}/injects/${injectId}/status`;
  return postReferential(schema.inject, uri, data)(dispatch);
};

// -- SCENARIOS --

export const addInjectForScenario = (scenarioId, data) => (dispatch) => {
  const uri = `/api/scenarios/${scenarioId}/injects`;
  return postReferential(schema.inject, uri, data)(dispatch);
};

export const fetchScenarioInjects = (scenarioId) => (dispatch) => {
  const uri = `/api/scenarios/${scenarioId}/injects`;
  return getReferential(schema.arrayOfInjects, uri)(dispatch);
};

export const updateInjectForScenario = (scenarioId, injectId, data) => (dispatch) => {
  const uri = `/api/scenarios/${scenarioId}/injects/${injectId}`;
  return putReferential(schema.inject, uri, data)(dispatch);
};

export const updateInjectActivationForScenario = (exerciseId, injectId, data) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/injects/${injectId}/activation`;
  return putReferential(schema.inject, uri, data)(dispatch);
};

export const deleteInjectScenario = (scenarioId, injectId, data) => (dispatch) => {
  const uri = `/api/scenarios/${scenarioId}/injects/${injectId}`;
  return delReferential(schema.inject, uri, data)(dispatch);
};
