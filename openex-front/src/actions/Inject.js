import * as schema from './Schema';
import {
  getReferential,
  fileSave,
  putReferential,
  postReferential,
  delReferential,
} from '../utils/Action';

export const fetchInjects = (exerciseId) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/injects`;
  return getReferential(schema.arrayOfInjects, uri)(dispatch);
};

export const fetchAllInjects = (exerciseId, noloading) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/injects`;
  return getReferential(schema.arrayOfInjects, uri, noloading)(dispatch);
};

export const downloadExportInjects = (exerciseId) => (dispatch) => fileSave(
  `/api/exercises/${exerciseId}/injects.xlsx`,
  'injects.xlsx',
)(dispatch);

export const updateInject = (exerciseId, injectId, data) => (dispatch) => {
  const uri = `/api/injects/${exerciseId}/${injectId}`;
  return putReferential(schema.inject, uri, data)(dispatch);
};

export const updateInjectActivation = (exerciseId, injectId, data) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/injects/${injectId}/activation`;
  return putReferential(schema.inject, uri, data)(dispatch);
};

export const addInject = (exerciseId, data) => (
  dispatch,
) => {
  const uri = `/api/exercises/${exerciseId}/injects`;
  return postReferential(schema.inject, uri, data)(dispatch);
};

export const deleteInject = (exerciseId, injectId) => (
  dispatch,
) => {
  const uri = `/api/exercises/${exerciseId}/injects/${injectId}`;
  return delReferential(uri, 'injects', injectId)(dispatch);
};

export const tryInject = (injectId) => (
  dispatch,
) => {
  const uri = `/api/injects/try/${injectId}`;
  return getReferential(null, uri, null)(dispatch);
};

export const shiftAllInjects = (exerciseId, data) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/injects`;
  return putReferential(schema.arrayOfInjects, uri, data)(dispatch);
};

export const simulateChangeDurationExercise = (exerciseId, data) => (
  dispatch,
) => postReferential(
  schema.simulateChangeDuration,
  `/api/exercises/${exerciseId}/injects/simulate/changeDuration`,
  data,
)(dispatch);

export const changeDurationExercise = (exerciseId, data) => (dispatch) => postReferential(
  schema.changeDuration,
  `/api/exercises/${exerciseId}/injects/changeDuration`,
  data,
)(dispatch);

export const fetchInjectTypesExerciseSimple = () => (dispatch) => getReferential(
  schema.injectTypeExerciseSimple,
  '/api/inject_types',
)(dispatch);

export const fetchInjectTypes = () => (dispatch) => getReferential(schema.arrayOfInjectTypes, '/api/inject_types')(dispatch);

export const injectDone = (injectId) => (dispatch) => {
  const data = { status: 'SUCCESS', message: ['Manual validation'] };
  const uri = `/api/injects/${injectId}/status`;
  return postReferential(null, uri, data)(dispatch);
};
