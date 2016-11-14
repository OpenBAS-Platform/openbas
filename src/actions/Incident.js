import * as Constants from '../constants/ActionTypes';
import {SubmissionError} from 'redux-form'
import {api} from '../App';
import * as schema from './Schema'
import {push} from 'react-router-redux'

export const fetchAllIncidents = (exerciseId) => (dispatch) => {
  dispatch({type: Constants.APPLICATION_FETCH_ALL_INCIDENTS_SUBMITTED});
  return api(schema.arrayOfIncidents).get('/api/exercise/' + exerciseId + '/incidents').then(function (response) {
    dispatch({
      type: Constants.APPLICATION_FETCH_ALL_INCIDENTS_SUCCESS,
      payload: response.data
    })
  }).catch(function (response) {
    dispatch({
      type: Constants.APPLICATION_FETCH_ALL_INCIDENTS_ERROR,
      payload: response.data
    })
  })
}

export const fetchIncidents = (exerciseId, eventId) => (dispatch) => {
  dispatch({type: Constants.APPLICATION_FETCH_INCIDENTS_SUBMITTED});
  return api(schema.arrayOfExercises).get('/api/exercises/' + exerciseId + '/events/' + eventId + '/incidents').then(function (response) {
    dispatch({
      type: Constants.APPLICATION_FETCH_INCIDENTS_SUCCESS,
      payload: response.data
    })
  }).catch(function (response) {
    dispatch({
      type: Constants.APPLICATION_FETCH_INCIDENTS_ERROR,
      payload: response.data
    })
  })
}