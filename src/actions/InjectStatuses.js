import * as Constants from '../constants/ActionTypes';
import {api} from '../App';
import * as schema from './Schema'

export const fetchInjectStatuses = () => (dispatch) => {
  dispatch({type: Constants.APPLICATION_FETCH_INJECT_STATUSES_SUBMITTED});
  return api(schema.arrayOfInjectStatuses).get('/api/inject_statuses').then(function (response) {
    dispatch({
      type: Constants.APPLICATION_FETCH_INJECT_STATUSES_SUCCESS,
      payload: response.data
    })
  }).catch(function (response) {
    dispatch({
      type: Constants.APPLICATION_FETCH_INJECT_STATUSES_ERROR,
      payload: response.data
    })
  })
}