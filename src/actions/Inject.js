import * as Constants from '../constants/ActionTypes';
import {SubmissionError} from 'redux-form'
import {api} from '../App';
import * as schema from './Schema'
import {Map} from 'immutable'

export const fetchInjects = (exerciseId, eventId, incidentId) => (dispatch) => {
  dispatch({type: Constants.APPLICATION_FETCH_INJECTS_SUBMITTED});
  return api(schema.arrayOfInjects).get('/api/exercises/' + exerciseId + '/events/' + eventId + '/incidents/' + incidentId + '/injects').then(function (response) {
    dispatch({
      type: Constants.APPLICATION_FETCH_INJECTS_SUCCESS,
      payload: response.data
    })
  }).catch(function (response) {
    dispatch({
      type: Constants.APPLICATION_FETCH_INJECTS_ERROR,
      payload: response.data
    })
  })
}

export const fetchInjectsOfEvent = (exerciseId, eventId) => (dispatch) => {
  dispatch({type: Constants.APPLICATION_FETCH_INJECTS_SUBMITTED});
  return api(schema.arrayOfInjects).get('/api/exercises/' + exerciseId + '/events/' + eventId + '/injects').then(function (response) {
    dispatch({
      type: Constants.APPLICATION_FETCH_INJECTS_SUCCESS,
      payload: response.data
    })
  }).catch(function (response) {
    dispatch({
      type: Constants.APPLICATION_FETCH_INJECTS_ERROR,
      payload: response.data
    })
  })
}

export const addInject = (exerciseId, eventId, incidentId, data) => (dispatch) => {
  dispatch({type: Constants.APPLICATION_ADD_INJECT_SUBMITTED});
  return api(schema.inject).post('/api/exercises/' + exerciseId + '/events/' + eventId + '/incidents/' + incidentId + '/injects', data).then(function (response) {
    dispatch({
      type: Constants.APPLICATION_ADD_INJECT_SUCCESS,
      payload: response.data
    })
  })
}

export const updateInject = (exerciseId, eventId, incidentId, injectId, data) => (dispatch) => {
  dispatch({type: Constants.APPLICATION_UPDATE_INJECT_SUBMITTED});
  return api(schema.inject).put('/api/exercises/' + exerciseId + '/events/' + eventId + '/incidents/' + incidentId + '/injects/' + injectId, data).then(function (response) {
    dispatch({
      type: Constants.APPLICATION_UPDATE_INJECT_SUCCESS,
      payload: response.data
    });
  }).catch(function () {
    dispatch({type: Constants.APPLICATION_UPDATE_INJECT_ERROR});
    throw new SubmissionError({_error: 'Failed to update inject!'})
  })
}

export const deleteInject = (exerciseId, eventId, incidentId, injectId) => (dispatch) => {
  dispatch({type: Constants.APPLICATION_DELETE_INJECT_SUBMITTED});
  return api().delete('/api/exercises/' + exerciseId + '/events/' + eventId + '/incidents/' + incidentId + '/injects/' + injectId).then(function (response) {
    dispatch({
      type: Constants.APPLICATION_DELETE_INJECT_SUCCESS,
      payload: Map({
          injectId: injectId,
          incidentId: incidentId,
          eventId: eventId,
          exerciseId: exerciseId
        }
      )
    })
  }).catch(function () {
    dispatch({type: Constants.APPLICATION_DELETE_INJECT_ERROR});
    throw new SubmissionError({_error: 'Failed to delete inject!'})
  })
}