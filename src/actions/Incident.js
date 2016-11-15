import * as Constants from '../constants/ActionTypes';
import {SubmissionError} from 'redux-form'
import {api} from '../App';
import * as schema from './Schema'
import {Map} from 'immutable'

export const fetchIncidents = (exerciseId, eventId) => (dispatch) => {
  dispatch({type: Constants.APPLICATION_FETCH_INCIDENTS_SUBMITTED});
  return api(schema.arrayOfIncidents).get('/api/exercises/' + exerciseId + '/events/' + eventId + '/incidents').then(function (response) {
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

export const addIncident = (exerciseId, eventId, data) => (dispatch) => {
  console.log('DATA', data)
  dispatch({type: Constants.APPLICATION_ADD_INCIDENT_SUBMITTED});
  return api(schema.incident).post('/api/exercises/' + exerciseId + '/events/' + eventId + '/incidents', data).then(function (response) {
    dispatch({
      type: Constants.APPLICATION_ADD_INCIDENT_SUCCESS,
      payload: response.data
    })
  }).catch(function () {
    dispatch({type: Constants.APPLICATION_ADD_INCIDENT_ERROR});
    throw new SubmissionError({_error: 'Failed to add incident!'})
  })
}

export const selectIncident = (exerciseId, eventId, incidentId) => (dispatch) => {
  dispatch({
    type: Constants.APPLICATION_SELECT_INCIDENT,
    payload: {exerciseId, eventId, incidentId}
  })
}

export const updateIncident = (exerciseId, eventId, incidentId, data) => (dispatch) => {
  dispatch({type: Constants.APPLICATION_UPDATE_INCIDENT_SUBMITTED});
  return api(schema.incident).put('/api/exercises/' + exerciseId + '/events/' + eventId + '/incidents/' + incidentId, data).then(function (response) {
    dispatch({
      type: Constants.APPLICATION_UPDATE_INCIDENT_SUCCESS,
      payload: response.data
    });
  }).catch(function () {
    dispatch({type: Constants.APPLICATION_UPDATE_INCIDENT_ERROR});
    throw new SubmissionError({_error: 'Failed to update incident!'})
  })
}

export const deleteIncident = (exerciseId, eventId, incidentId) => (dispatch) => {
  dispatch({type: Constants.APPLICATION_DELETE_INCIDENT_SUBMITTED});
  return api().delete('/api/exercises/' + exerciseId + '/events/' + eventId + '/incidents/' + incidentId).then(function (response) {
    dispatch({
      type: Constants.APPLICATION_DELETE_INCIDENT_SUCCESS,
      payload: Map({
          incidentId: incidentId,
          eventId: eventId,
          exerciseId: exerciseId
        }
      )
    })
  }).catch(function () {
    dispatch({type: Constants.APPLICATION_DELETE_INCIDENT_ERROR});
    throw new SubmissionError({_error: 'Failed to delete incident!'})
  })
}