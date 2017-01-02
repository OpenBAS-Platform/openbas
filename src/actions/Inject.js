import * as schema from './Schema'
import {getReferential, putReferential, postReferential, delReferential} from '../utils/Action'

export const fetchInjects = (exerciseId, eventId) => (dispatch) => {
  var uri = '/api/exercises/' + exerciseId + '/events/' + eventId + '/injects'
  return getReferential(schema.arrayOfInjects, uri)(dispatch)
}

export const fetchAllInjects = (exerciseId, noloading) => (dispatch) => {
  var uri = '/api/exercises/' + exerciseId + '/injects'
  return getReferential(schema.arrayOfInjects, uri, noloading)(dispatch)
}

export const updateInject = (exerciseId, eventId, incidentId, injectId, data, noloading) => (dispatch) => {
  var uri = '/api/exercises/' + exerciseId + '/events/' + eventId + '/incidents/' + incidentId + '/injects/' + injectId
  return putReferential(schema.inject, uri, data, noloading)(dispatch)
}

export const addInject = (exerciseId, eventId, incidentId, data) => (dispatch) => {
  var uri = '/api/exercises/' + exerciseId + '/events/' + eventId + '/incidents/' + incidentId + '/injects'
  return postReferential(schema.inject, uri, data)(dispatch)
}

export const deleteInject = (exerciseId, eventId, incidentId, injectId) => (dispatch) => {
  var uri = '/api/exercises/' + exerciseId + '/events/' + eventId + '/incidents/' + incidentId + '/injects/' + injectId
  return delReferential(uri, 'injects', injectId)(dispatch)
}

export const fetchInjectTypes = () => (dispatch) => {
  return getReferential(schema.arrayOfInjectTypes, '/api/inject_types')(dispatch)
}