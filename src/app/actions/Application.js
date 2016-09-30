import * as Constants from '../constants/ActionTypes'
import {api} from '../App'
import * as schema from './Schema'
import { SubmissionError } from 'redux-form'

export const askToken = (username, password) => (dispatch) => {
  dispatch({type: Constants.APPLICATION_LOGIN_SUBMITTED});
  var data = {login: username, password: password};
  return api(schema.token).post('/api/tokens', data).then(function (response) {
    //Set the localStorage token and dispatch LOGIN SUCCESS
    localStorage.setItem('token', JSON.stringify(response.data.toJS()))
    dispatch({
      type: Constants.APPLICATION_LOGIN_SUCCESS,
      payload: response.data
    });
  }).catch(function () {
    //Remove the token from local storage and dispatch LOGIN ERROR
    localStorage.removeItem('token');
    throw new SubmissionError({_error: 'Login failed!'})
  })
}

export const logout = () => (dispatch, getState) => {
  let token_id = getState().application.get('token');
  dispatch({type: Constants.APPLICATION_LOGOUT_SUBMITTED});
  return api().delete('/api/tokens/' + token_id).then(function () {
    //Set the localStorage token and dispatch LOGIN SUCCESS
    localStorage.removeItem('token');
    dispatch({type: Constants.APPLICATION_LOGOUT_SUCCESS});
  }).catch(function (response) {
    dispatch({
      type: Constants.APPLICATION_LOGOUT_ERROR,
      payload: response.data
    });
  })
}

export const userInfo = () => (dispatch, getState) => {
  let user_id = getState().application.get('user');
  dispatch({type: Constants.APPLICATION_FETCH_USER_SUBMITTED});
  return api().get('/api/user/' + user_id).then(function (response) {
    dispatch({
      type: Constants.APPLICATION_FETCH_USER_SUCCESS,
      payload: response.data
    });
  }).catch(function (response) {
    console.error(response)
    dispatch({type: Constants.APPLICATION_FETCH_USER_ERROR});
  })
}