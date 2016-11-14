import * as Constants from '../constants/ActionTypes';
import {SubmissionError} from 'redux-form'
import {api} from '../App';
import * as schema from './Schema'
import {Map} from 'immutable'

export const fetchEvents = (exerciseId) => (dispatch) => {
  dispatch({type: Constants.APPLICATION_FETCH_EVENTS_SUBMITTED});
  return api(schema.arrayOfEvents).get('/api/exercises/' + exerciseId + '/events').then(function (response) {
    dispatch({
      type: Constants.APPLICATION_FETCH_EVENTS_SUCCESS,
      payload: response.data
    })
  }).catch(function (response) {
    dispatch({
      type: Constants.APPLICATION_FETCH_EVENTS_ERROR,
      payload: response.data
    })
  })
}

export const addEvent = (exerciseId, data) => (dispatch) => {
  dispatch({type: Constants.APPLICATION_ADD_EVENT_SUBMITTED});
  return api(schema.event).post('/api/exercises/' + exerciseId + '/events', data).then(function (response) {
    dispatch({
      type: Constants.APPLICATION_ADD_EVENT_SUCCESS,
      payload: response.data
    })
  }).catch(function () {
    dispatch({type: Constants.APPLICATION_ADD_EVENT_ERROR});
    throw new SubmissionError({_error: 'Failed to add event!'})
  })
}

export const updateEvent = (exerciseId, eventId, data) => (dispatch) => {
  dispatch({type: Constants.APPLICATION_UPDATE_EVENT_SUBMITTED});
  return api(schema.event).put('/api/exercises/' + exerciseId + '/events/' + eventId, data).then(function (response) {
    dispatch({
      type: Constants.APPLICATION_UPDATE_EVENT_SUCCESS,
      payload: response.data
    });
  }).catch(function () {
    dispatch({type: Constants.APPLICATION_UPDATE_EVENT_ERROR});
    throw new SubmissionError({_error: 'Failed to update event!'})
  })
}

export const deleteEvent = (exerciseId, eventId) => (dispatch) => {
  dispatch({type: Constants.APPLICATION_DELETE_EVENT_SUBMITTED});
  return api().delete('/api/exercises/' + exerciseId + '/events/' + eventId).then(function (response) {
    dispatch({
      type: Constants.APPLICATION_DELETE_AUDIENCE_SUCCESS,
      payload: Map({
          eventId: eventId,
          exerciseId: exerciseId
        }
      )
    })
  }).catch(function () {
    dispatch({type: Constants.APPLICATION_DELETE_EVENT_ERROR});
    throw new SubmissionError({_error: 'Failed to delete event!'})
  })
}