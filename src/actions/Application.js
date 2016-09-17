import * as Constants from '../constants/ActionTypes';
import axios from 'axios';

export const askToken = (username, password) => (dispatch) => {
  console.log('Login ' + username + "/" + password);
  dispatch({type: Constants.APPLICATION_LOGIN_SUBMITTED});
  return axios.post('/api/tokens', {
    login: username,
    password: password
  }).then(function (response) {
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
  var app = getState().application;
  let token_id = app.getIn(['token', 'token_id']);
  let token_value = app.getIn(['token', 'token_value']);
  console.log('Logout ' + token_value)
  dispatch({type: Constants.APPLICATION_LOGOUT_SUBMITTED});
  return axios.delete('/api/tokens/' + token_id, {
    headers: {'X-Auth-Token': token_value}
  }).then(function (response) {
    //Set the localStorage token and dispatch LOGIN SUCCESS
    localStorage.removeItem('token');
    dispatch({
      type: Constants.APPLICATION_LOGOUT_SUCCESS,
      payload: null
    });
  }).catch(function (response) {
    dispatch({
      type: Constants.APPLICATION_LOGOUT_ERROR,
      payload: null
    });
  })
}