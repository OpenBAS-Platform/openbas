import * as schema from './Schema'
import {getReferential, putReferential, postReferential, delReferential} from '../utils/Action'

export const fetchEvents = (exerciseId) => (dispatch) => {
  var uri = '/api/exercises/' + exerciseId + '/events'
  return getReferential(schema.arrayOfEvents, uri)(dispatch)
}

export const updateEvent = (exerciseId, eventId, data) => (dispatch) => {
  var uri = '/api/exercises/' + exerciseId + '/events/' + eventId
  return putReferential(schema.event, uri, data)(dispatch)
}

export const addEvent = (exerciseId, data) => (dispatch) => {
  var uri = '/api/exercises/' + exerciseId + '/events'
  return postReferential(schema.event, uri, data)(dispatch)
}

export const deleteEvent = (exerciseId, eventId) => (dispatch) => {
  var uri = '/api/exercises/' + exerciseId + '/events/' + eventId
  return delReferential(uri, 'events', eventId)(dispatch)
}