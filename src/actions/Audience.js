import * as Constants from '../constants/ActionTypes';
import {SubmissionError} from 'redux-form'
import {api} from '../App';
import * as schema from './Schema'
import {Map} from 'immutable'

//Region for later usage
export const getReferential = (schema, uri) => (dispatch) => {
  dispatch({type: Constants.DATA_FETCH_SUBMITTED});
  return api(schema).get(uri).then(function (response) {
    dispatch({type: Constants.DATA_FETCH_SUCCESS, payload: response.data})
  }).catch(function () {
    dispatch({type: Constants.DATA_FETCH_ERROR});
    throw new SubmissionError({_error: 'Failed to fetch from ' + uri})
  })
}

export const putReferential = (schema, uri, data) => (dispatch) => {
  dispatch({type: Constants.DATA_FETCH_SUBMITTED});
  return api(schema).put(uri, data).then(function (response) {
    var payload = response.data
    dispatch({type: Constants.DATA_FETCH_SUCCESS, payload})
    return payload
  }).catch(function () {
    dispatch({type: Constants.DATA_FETCH_ERROR});
    throw new SubmissionError({_error: 'Failed to update from ' + uri})
  })
}

export const postReferential = (schema, uri, data) => (dispatch) => {
  dispatch({type: Constants.DATA_FETCH_SUBMITTED});
  return api(schema).post(uri, data).then(function (response) {
    var payload = response.data
    dispatch({type: Constants.DATA_FETCH_SUCCESS, payload})
    return payload
  }).catch(function () {
    dispatch({type: Constants.DATA_FETCH_ERROR});
    throw new SubmissionError({_error: 'Failed to add from ' + uri})
  })
}

/*
export const fetchAudiences = (exerciseId) => (dispatch) => {
  return getReferential(schema.arrayOfAudiences, '/api/exercises/' + exerciseId + '/audiences')(dispatch)
}

export const updateAudience = (exerciseId, audienceId, data) => (dispatch) => {
  return putReferential(schema.audience, '/api/exercises/' + exerciseId + '/audiences/' + audienceId, data)(dispatch)
}
*/
//endregion

export const fetchAudiences = (exerciseId) => (dispatch) => {
  dispatch({type: Constants.APPLICATION_FETCH_AUDIENCES_SUBMITTED});
  return api(schema.arrayOfAudiences).get('/api/exercises/' + exerciseId + '/audiences').then(function (response) {
    dispatch({
      type: Constants.APPLICATION_FETCH_AUDIENCES_SUCCESS,
      payload: response.data
    })
  })
}

export const searchAudiences = (keyword) => (dispatch) => {
  dispatch({
    type: Constants.APPLICATION_SEARCH_AUDIENCES_SUBMITTED,
    payload: keyword
  })
}

export const addAudience = (exerciseId, data) => (dispatch) => {
  return postReferential(schema.audience, '/api/exercises/' + exerciseId + '/audiences', data)(dispatch)
}

export const selectAudience = (exercise_id, audience_id) => (dispatch) => {
  dispatch({type: Constants.APPLICATION_SELECT_AUDIENCE, payload: {exercise_id, audience_id}})
}

export const updateAudience = (exerciseId, audienceId, data) => (dispatch) => {
  dispatch({type: Constants.APPLICATION_UPDATE_AUDIENCE_SUBMITTED});
  return api(schema.audience).put('/api/exercises/' + exerciseId + '/audiences/' + audienceId, data).then(function (response) {
    dispatch({
      type: Constants.APPLICATION_UPDATE_AUDIENCE_SUCCESS,
      payload: response.data
    })
  }).catch(function () {
    dispatch({type: Constants.APPLICATION_UPDATE_AUDIENCE_ERROR});
    throw new SubmissionError({_error: 'Failed to update audience!'})
  })
}

export const deleteAudience = (exerciseId, audienceId) => (dispatch) => {
  dispatch({type: Constants.APPLICATION_DELETE_AUDIENCE_SUBMITTED});
  return api().delete('/api/exercises/' + exerciseId + '/audiences/' + audienceId).then(function () {
    dispatch({
      type: Constants.APPLICATION_DELETE_AUDIENCE_SUCCESS,
      payload: Map({
          type: 'audiences',
          id: audienceId,
          //Old compatibility
          audienceId: audienceId,
          exerciseId: exerciseId
        }
      )
    })
  }).catch(function () {
    dispatch({type: Constants.APPLICATION_DELETE_AUDIENCE_ERROR});
    throw new SubmissionError({_error: 'Failed to delete audience!'})
  })
}
