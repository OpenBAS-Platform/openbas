import * as Constants from '../constants/ActionTypes';
import * as schema from './Schema'
import {getReferential, putReferential, postReferential, delReferential} from '../utils/Action'

export const fetchAudiences = (exerciseId) => (dispatch) => {
  var uri = '/api/exercises/' + exerciseId + '/audiences'
  return getReferential(schema.arrayOfAudiences, uri)(dispatch)
}

export const updateAudience = (exerciseId, audienceId, data) => (dispatch) => {
  var uri = '/api/exercises/' + exerciseId + '/audiences/' + audienceId
  return putReferential(schema.audience, uri, data)(dispatch)
}

export const addAudience = (exerciseId, data) => (dispatch) => {
  var uri = '/api/exercises/' + exerciseId + '/audiences'
  return postReferential(schema.audience, uri, data)(dispatch)
}

export const deleteAudience = (exerciseId, audienceId) => (dispatch) => {
  var uri = '/api/exercises/' + exerciseId + '/audiences/' + audienceId
  return delReferential(uri, 'audiences', audienceId)(dispatch)
}

export const selectAudience = (exercise_id, audience_id) => (dispatch) => {
  dispatch({type: Constants.APPLICATION_SELECT_AUDIENCE, payload: {exercise_id, audience_id}})
}