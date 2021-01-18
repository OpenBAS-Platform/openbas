import { push } from 'connected-react-router';
import { FORM_ERROR } from 'final-form';
import * as Constants from '../constants/ActionTypes';
import * as schema from './Schema';
import { postReferential, getReferential } from '../utils/Action';

export const askToken = (username, password) => (dispatch) => {
  const data = { login: username, password };
  return postReferential(
    schema.token,
    '/api/auth',
    data,
  )(dispatch).then((finalData) => {
    // eslint-disable-next-line no-underscore-dangle
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
)(dispatch)
  .then((data) => {
    dispatch({ type: Constants.IDENTITY_LOGIN_SUCCESS, payload: data });
  })
  .catch(() => {
    dispatch({
      type: Constants.IDENTITY_LOGIN_FAILED,
      payload: { status: 'ERROR' },
    });
  });

export const fetchToken = () => (dispatch, getState) => getReferential(
  schema.token,
  `/api/tokens/${getState().app.logged.token}`,
)(dispatch);

export const logout = () => (dispatch) => {
  dispatch({ type: Constants.IDENTITY_LOGOUT_SUCCESS });
};

export const toggleLeftUnfolding = () => (dispatch) => {
  dispatch({ type: Constants.APPLICATION_NAVBAR_LEFT_TOGGLE_UNFOLDING });
};

export const toggleLeftConfiguration = () => (dispatch) => {
  dispatch({ type: Constants.APPLICATION_NAVBAR_LEFT_TOGGLE_CONFIGURATION });
};

export const savedDismiss = () => (dispatch) => {
  dispatch({ type: Constants.DATA_SAVED_DISMISS });
};

export const redirectToHome = () => (dispatch) => {
  dispatch(push('/'));
};

export const redirectToAdmin = () => (dispatch) => {
  dispatch(push('/private/admin/index'));
};

export const redirectToExercise = (exerciseId) => (dispatch) => {
  dispatch(push(`/private/exercise/${exerciseId}`));
};

export const redirectToScenario = (exerciseId) => (dispatch) => {
  dispatch(push(`/private/exercise/${exerciseId}/scenario`));
};

export const redirectToAudiences = (exerciseId) => (dispatch) => {
  dispatch(push(`/private/exercise/${exerciseId}/audiences`));
};

export const redirectToEvent = (exerciseId, eventId) => (dispatch) => {
  dispatch(push(`/private/exercise/${exerciseId}/scenario/${eventId}`));
};

export const redirectToChecks = (exerciseId) => (dispatch) => {
  dispatch(push(`/private/exercise/${exerciseId}/checks`));
};

export const redirectToComcheck = (exerciseId, comcheckId) => (dispatch) => {
  dispatch(
    push(`/private/exercise/${exerciseId}/checks/comcheck/${comcheckId}`),
  );
};

export const redirectToDryrun = (exerciseId, dryrunId) => (dispatch) => {
  dispatch(push(`/private/exercise/${exerciseId}/checks/dryrun/${dryrunId}`));
};
