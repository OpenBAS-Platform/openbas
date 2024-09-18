import * as schema from './Schema';
import { bulkDeleteReferential, delReferential, getReferential, postReferential, putReferential } from '../utils/Action';

// -- INJECTS --

export const fetchInject = (injectId) => (dispatch) => {
  const uri = `/api/injects/${injectId}`;
  return getReferential(schema.inject, uri)(dispatch);
};

// -- EXERCISES --

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

export const updateInjectTriggerForExercise = (exerciseId, injectId) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/injects/${injectId}/trigger`;
  return putReferential(schema.inject, uri)(dispatch);
};

export const updateInjectActivationForExercise = (exerciseId, injectId, data) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/injects/${injectId}/activation`;
  return putReferential(schema.inject, uri, data)(dispatch);
};

export const addInjectForExercise = (exerciseId, data) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/injects`;
  return postReferential(schema.inject, uri, data)(dispatch);
};

export const duplicateInjectForExercise = (exerciseId, injectId) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/injects/${injectId}`;
  return postReferential(schema.inject, uri, null)(dispatch);
};

export const deleteInjectForExercise = (exerciseId, injectId) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/injects/${injectId}`;
  return delReferential(uri, 'injects', injectId)(dispatch);
};

export const bulkDeleteInjectsForExercise = (exerciseId, injectIds) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/injects`;
  return bulkDeleteReferential(uri, 'injects', injectIds)(dispatch);
};

export const executeInject = (exerciseId, values, files) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/inject`;
  const formData = new FormData();
  formData.append('file', files && files.length > 0 ? files[0] : null);
  const blob = new Blob([JSON.stringify(values)], { type: 'application/json' });
  formData.append('input', blob);
  return postReferential(schema.injectStatus, uri, formData)(dispatch);
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

export const duplicateInjectForScenario = (scenarioId, injectId) => (dispatch) => {
  const uri = `/api/scenarios/${scenarioId}/injects/${injectId}`;
  return postReferential(schema.inject, uri, null)(dispatch);
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
  const uri = `/api/scenarios/${exerciseId}/injects/${injectId}/activation`;
  return putReferential(schema.inject, uri, data)(dispatch);
};

export const deleteInjectScenario = (scenarioId, injectId) => (dispatch) => {
  const uri = `/api/scenarios/${scenarioId}/injects/${injectId}`;
  return delReferential(uri, 'injects', injectId)(dispatch);
};

export const bulkDeleteInjectsForScenario = (scenarioId, injectIds) => (dispatch) => {
  const uri = `/api/scenarios/${scenarioId}/injects`;
  return bulkDeleteReferential(uri, 'injects', injectIds)(dispatch);
};
