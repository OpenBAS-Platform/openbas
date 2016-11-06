import * as Constants from '../constants/ActionTypes';
import {api} from '../App';
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
  let user_id = getState().application.get('user');
  dispatch({type: Constants.APPLICATION_FETCH_USER_SUBMITTED});
  return api().get('/api/users/' + user_id).then(function (response) {
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