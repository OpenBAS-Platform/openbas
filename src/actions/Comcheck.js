import * as schema from './Schema'
import {getReferential, postReferential} from '../utils/Action'

export const fetchComchecks = (exerciseId, noloading) => (dispatch) => {
  var uri = '/api/exercises/' + exerciseId + '/comchecks'
  return getReferential(schema.arrayOfComchecks, uri, noloading)(dispatch)
}

export const fetchComcheck = (exerciseId, comcheckId, noloading) => (dispatch) => {
  var uri = '/api/exercises/' + exerciseId + '/comchecks/' + comcheckId
  return getReferential(schema.comcheck, uri, noloading)(dispatch)
}

export const addComcheck = (exerciseId, data) => (dispatch) => {
  var uri = '/api/exercises/' + exerciseId + '/comchecks'
  return postReferential(schema.comcheck, uri, data)(dispatch)
}

export const fetchComcheckStatuses = (exerciseId, comcheckId, noloading) => (dispatch) => {
  var uri = '/api/exercises/' + exerciseId + '/comchecks/' + comcheckId + '/statuses'
  return getReferential(schema.arrayOfComcheckStatuses, uri, noloading)(dispatch)
}

export const fetchComcheckStatus = (statusId) => (dispatch) => {
  var uri = '/api/anonymous/comcheck/' + statusId
  return getReferential(schema.comcheckStatus, uri)(dispatch)
}