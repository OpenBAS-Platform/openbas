import * as schema from './Schema';
import {
  getReferential,
  putReferential,
  postReferential,
  delReferential,
  fileSave,
} from '../utils/Action';

export const fetchExercises = () => (dispatch) => getReferential(schema.arrayOfExercises, '/api/exercises')(dispatch);

export const fetchExercise = (exerciseId) => (dispatch) => getReferential(schema.exercise, `/api/exercises/${exerciseId}`)(dispatch);

export const addExercise = (data) => (dispatch) => postReferential(schema.exercise, '/api/exercises', data)(dispatch);

export const updateExercise = (exerciseId, type, data) => (dispatch) => putReferential(
  schema.exercise,
  `/api/exercises/${exerciseId}/${type}`,
  data,
)(dispatch);

export const deleteExercise = (exerciseId) => (dispatch) => delReferential(
  `/api/exercises/${exerciseId}`,
  'exercises',
  exerciseId,
)(dispatch);

export const exportExercise = (exerciseId, data) => (dispatch) => {
  let uri = `/api/exercises/${exerciseId}/export?export_exercise=${data.exercise}&export_audience=${data.audience}&export_objective=${data.objective}&export_scenarios=${data.scenarios}&export_injects=${data.injects}&export_incidents=${data.incidents}`;

  if (data.export_path !== undefined) {
    uri += `&export_path=${data.export_path}`;
    return getReferential(schema.exportExerciseResult, uri)(dispatch);
  }
  return fileSave(uri, 'export.xlsx')(dispatch);
};

export const importExercise = (fileId, data) => (dispatch) => {
  const uri = `/api/exercises/import?file=${fileId}&import_exercise=${data.exercise}&import_audience=${data.audience}&import_objective=${data.objective}&import_scenarios=${data.scenarios}&import_injects=${data.injects}&import_incidents=${data.incidents}`;

  return postReferential(schema.importExerciseResult, uri, data)(dispatch);
};

export const importExerciseFromPath = (data) => (dispatch) => {
  const uri = `/api/exercises/import?import_exercise=${data.exercise}&import_audience=${data.audience}&import_objective=${data.objective}&import_scenarios=${data.scenarios}&import_injects=${data.injects}&import_incidents=${data.incidents}&import_path=${data.import_path}`;

  return postReferential(schema.importExerciseResult, uri, data)(dispatch);
};

export const exportInjectEml = (exerciseId) => (dispatch) => fileSave(
  `/api/exercises/${exerciseId}/export/inject/eml`,
  'openex_export_messages_eml.zip',
)(dispatch);

export const checkIfExerciseNameExist = (fileId) => (dispatch) => getReferential(
  schema.checkIfExerciseNameExistResult,
  `/api/exercises/import/check/exercise/${fileId}`,
)(dispatch);

export const getStatisticsForExercise = (exerciseId, data) => (dispatch) => getReferential(
  schema.objectOfStatistics,
  `/api/exercises/${exerciseId}/statistics?interval=${data.value}`,
)(dispatch);
