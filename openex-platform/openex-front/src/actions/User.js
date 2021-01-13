import * as schema from './Schema';
import * as Constants from '../constants/ActionTypes';
import {
  getReferential,
  postReferential,
  putReferential,
  delReferential,
} from '../utils/Action';

export const fetchUsers = () => (dispatch) => getReferential(schema.arrayOfUsers, '/api/users')(dispatch);

export const addUser = (data) => (dispatch) => postReferential(schema.user, '/api/users', data)(dispatch);

export const updateUser = (userId, data) => (dispatch) => putReferential(
  schema.user,
  `/api/users/${userId}`,
  data,
)(dispatch).then((finalData) => {
  dispatch({
    type: Constants.LANG_UPDATE_ON_USER_CHANGE,
    payload: finalData,
  });
});

export const deleteUser = (userId) => (dispatch) => delReferential(`/api/users/${userId}`, 'users', userId)(dispatch);
