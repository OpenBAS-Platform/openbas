import * as schema from './Schema';
import {
  getReferential,
  putReferential,
  postReferential,
  delReferential,
} from '../utils/Action';

export const fetchEvaluations = (exerciseId, objectiveId) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/objectives/${objectiveId}/evalutions`;
  return getReferential(schema.arrayOfEvaluations, uri)(dispatch);
};

export const updateEvaluation = (exerciseId, objectiveId, evaluationId, data) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/objectives/${objectiveId}/evaluations/${evaluationId}`;
  return putReferential(schema.evaluation, uri, data)(dispatch);
};

export const addEvaluation = (exerciseId, objectiveId, data) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/objectives/${objectiveId}/evaluations`;
  return postReferential(schema.evaluation, uri, data)(dispatch);
};

export const deleteEvaluation = (exerciseId, objectiveId, evaluationId) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/objectives/${objectiveId}/evaluation/${evaluationId}`;
  return delReferential(uri, 'evaluations', evaluationId)(dispatch);
};
