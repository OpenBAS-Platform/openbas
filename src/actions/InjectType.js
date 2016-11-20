import * as Constants from '../constants/ActionTypes';
import {api} from '../App';
import * as schema from './Schema'

export const fetchInjectTypes = () => (dispatch) => {
  dispatch({type: Constants.APPLICATION_FETCH_INJECT_TYPES_SUBMITTED});
  return api(schema.arrayOfInjectTypes).get('/api/inject_types').then(function (response) {
    dispatch({
      type: Constants.APPLICATION_FETCH_INJECT_TYPES_SUCCESS,
      payload: response.data
    })
  }).catch(function (response) {
    dispatch({
      type: Constants.APPLICATION_FETCH_INJECT_TYPES_ERROR,
      payload: response.data
    })
  })
}