import { FORM_ERROR } from 'final-form';
import * as Constants from '../constants/ActionTypes';
import * as schema from './Schema';
import {
  getReferential,
  postReferential,
  putReferential,
  simpleCall,
} from '../utils/Action';

export const fetchParameters = () => (dispatch) => getReferential(schema.arrayOfParameters, '/api/settings')(dispatch);

export const updateParameters = (data) => (dispatch) => putReferential(schema.arrayOfParameters, '/api/settings', data)(dispatch);

export const askToken = (username, password) => (dispatch) => {
  const data = { login: username, password };
  const ref = postReferential(schema.user, '/api/login', data)(dispatch);
  // eslint-disable-next-line arrow-body-style
  return ref.then((finalData) => {
    if (finalData[FORM_ERROR]) {
      return finalData;
    }
    return dispatch({
      type: Constants.IDENTITY_LOGIN_SUCCESS,
      payload: finalData,
    });
  });
};

export const checkKerberos = () => (dispatch) => getReferential(
  schema.token,
  '/api/auth/kerberos',
)(dispatch).catch(() => {
  dispatch({
    type: Constants.IDENTITY_LOGIN_FAILED,
    payload: { status: 'ERROR' },
  });
});

export const fetchMe = () => (dispatch) => {
  const ref = getReferential(schema.user, '/api/me')(dispatch);
  return ref.then((data) => dispatch({ type: Constants.IDENTITY_LOGIN_SUCCESS, payload: data }));
};

export const logout = () => (dispatch) => {
  const ref = simpleCall('/logout');
  return ref.then(() => dispatch({ type: Constants.IDENTITY_LOGOUT_SUCCESS }));
};

export const fetchStatistics = () => (dispatch) => {
  const uri = '/api/statistics';
  return getReferential(schema.statistics, uri)(dispatch);
};
