import * as Constants from '../constants/ActionTypes';
import * as schema from './Schema';
// eslint-disable-next-line import/no-cycle
import {
  getReferential,
  fileSave,
  putReferential,
  postReferential,
  delReferential,
} from '../utils/Action';

export const fetchSubaudiences = (exerciseId) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/subaudiences`;
  return getReferential(schema.arrayOfSubaudiences, uri)(dispatch);
};

export const downloadExportSubaudience = (
  exerciseId,
  audienceId,
  subaudienceId,
) => (dispatch) => fileSave(
  `/api/exercises/${
    exerciseId
  }/audiences/${
    audienceId
  }/subaudiences/${
    subaudienceId
  }/users.xlsx`,
)(dispatch);

export const updateSubaudience = (
  exerciseId,
  audienceId,
  subaudienceId,
  data,
) => (dispatch) => {
  const uri = `/api/exercises/${
    exerciseId
  }/audiences/${
    audienceId
  }/subaudiences/${
    subaudienceId}`;
  return putReferential(schema.subaudience, uri, data)(dispatch);
};

export const addSubaudience = (exerciseId, audienceId, data) => (dispatch) => {
  const uri = `/api/exercises/${
    exerciseId
  }/audiences/${
    audienceId
  }/subaudiences`;
  return postReferential(schema.subaudience, uri, data)(dispatch);
};

export const deleteSubaudience = (exerciseId, audienceId, subaudienceId) => (
  dispatch,
) => {
  const uri = `/api/exercises/${
    exerciseId
  }/audiences/${
    audienceId
  }/subaudiences/${
    subaudienceId}`;
  return delReferential(uri, 'subaudiences', subaudienceId)(dispatch);
};

export const selectSubaudience = (exerciseId, audienceId, subaudienceId) => (
  dispatch,
) => {
  dispatch({
    type: Constants.APPLICATION_SELECT_SUBAUDIENCE,
    payload: { exerciseId, audienceId, subaudienceId },
  });
};
