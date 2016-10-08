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