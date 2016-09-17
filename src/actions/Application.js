import * as Constants from '../constants/ActionTypes';
import {api} from '../App';
import * as schema from './Schema'

export const askToken = (username, password) => (dispatch) => {
  dispatch({type: Constants.APPLICATION_LOGIN_SUBMITTED});
  var data = {login: username, password: password};
  return api(schema.token).post('/api/tokens', data).then(function (response) {
    //Set the localStorage token and dispatch LOGIN SUCCESS
    localStorage.setItem('token', JSON.stringify(response.data))
    dispatch({
      type: Constants.APPLICATION_LOGIN_SUCCESS,
      payload: response.data
    });
  }).catch(function (response) {
    //Remove the token from local storage and dispatch LOGIN ERROR
    localStorage.removeItem('token');
    dispatch({
      type: Constants.APPLICATION_LOGIN_ERROR,
      payload: null
    });
  })
}

export const logout = () => (dispatch, getState) => {
  let token_id = getState().application.getIn(['token', 'token_id']);
  dispatch({type: Constants.APPLICATION_LOGOUT_SUBMITTED});
  return api().delete('/api/tokens/' + token_id).then(function (response) {
    //Set the localStorage token and dispatch LOGIN SUCCESS
    localStorage.removeItem('token');
    dispatch({
      type: Constants.APPLICATION_LOGOUT_SUCCESS,
      payload: response.data
    });
  }).catch(function (response) {
    dispatch({
      type: Constants.APPLICATION_LOGOUT_ERROR,
      payload: response.data
    });
  })
}