import * as Constants from '../constants/ActionTypes';
import {api} from '../App';
import {SubmissionError} from 'redux-form'
import * as schema from './Schema'

export const fetchUsers = () => (dispatch) => {
  dispatch({type: Constants.APPLICATION_FETCH_USERS_SUBMITTED});
  return api(schema.arrayOfUsers).get('/api/users').then(function (response) {
    dispatch({
      type: Constants.APPLICATION_FETCH_USERS_SUCCESS,
      payload: response.data
    })
  }).catch(function (response) {
    dispatch({
      type: Constants.APPLICATION_FETCH_USERS_ERROR,
      payload: response.data
    })
  })
}

export const fetchUser = () => (dispatch, getState) => {
  let userId = getState().application.get('user');
  dispatch({type: Constants.APPLICATION_FETCH_USER_SUBMITTED});
  return api().get('/api/users/' + userId).then(function (response) {
    dispatch({
      type: Constants.APPLICATION_FETCH_USER_SUCCESS,
      payload: response.data
    });
  }).catch(function (response) {
    console.error(response)
    dispatch({type: Constants.APPLICATION_FETCH_USER_ERROR});
  })
}

export const searchUsers = (keyword) => (dispatch) => {
  dispatch({
    type: Constants.APPLICATION_SEARCH_USERS_SUBMITTED,
    payload: keyword
  })
}

export const addUser = (data) => (dispatch) => {
  console.log('USER', data)
  dispatch({type: Constants.APPLICATION_ADD_USER_SUBMITTED});
  return api(schema.user).post('/api/users', data).then(function (response) {
    dispatch({
      type: Constants.APPLICATION_ADD_USER_SUCCESS,
      payload: response.data
    });
  }).catch(function () {
    dispatch({type: Constants.APPLICATION_ADD_USER_ERROR});
    throw new SubmissionError({_error: 'Failed to add user!'})
  })
}