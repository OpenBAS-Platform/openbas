import * as schema from './Schema';
import { getReferential, putReferential, postReferential, delReferential } from '../utils/Action';

export const fetchReports = (exerciseId) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/reports`;
  return getReferential(schema.arrayOfReports, uri)(dispatch);
};

export const updateReport = (exerciseId, reportId, data) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/reports/${reportId}`;
  return putReferential(schema.report, uri, data)(dispatch);
};

export const addReport = (exerciseId, data) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/reports`;
  return postReferential(schema.report, uri, data)(dispatch);
};

export const deleteReport = (exerciseId, reportId) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/reports/${reportId}`;
  return delReferential(uri, 'reports', reportId)(dispatch);
};
