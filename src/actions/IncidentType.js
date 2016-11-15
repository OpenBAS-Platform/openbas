import * as Constants from '../constants/ActionTypes';
import {api} from '../App';
import * as schema from './Schema'

export const fetchIncidentTypes = () => (dispatch) => {
  dispatch({type: Constants.APPLICATION_FETCH_INCIDENT_TYPES_SUBMITTED});
  return api(schema.arrayOfIncidentTypes).get('/api/incident_types').then(function (response) {
    dispatch({
      type: Constants.APPLICATION_FETCH_INCIDENT_TYPES_SUCCESS,
      payload: response.data
    })
  }).catch(function (response) {
    dispatch({
      type: Constants.APPLICATION_FETCH_INCIDENT_TYPES_ERROR,
      payload: response.data
    })
  })
}