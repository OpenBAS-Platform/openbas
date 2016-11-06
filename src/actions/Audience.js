import * as Constants from '../constants/ActionTypes';
import {SubmissionError} from 'redux-form'
import {api} from '../App';
import * as schema from './Schema'
import {Map} from 'immutable'

export const fetchAudiences = (exerciseId) => (dispatch, getState) => {
  dispatch({type: Constants.APPLICATION_FETCH_AUDIENCES_SUBMITTED});
  return api(schema.arrayOfAudiences).get('/api/exercises/' + exerciseId + '/audiences').then(function (response) {
    dispatch({
      type: Constants.APPLICATION_FETCH_AUDIENCES_SUCCESS,
      payload: response.data
    })
    let currentAudience = getState().application.getIn(['ui', 'states', 'current_audience']);
    let result = response.data.get('result')
    if (currentAudience === undefined && result.count() > 0) {
      dispatch({
        type: Constants.APPLICATION_SELECT_AUDIENCE,
        payload: result.first()
      })
    }
  }).catch(function (response) {
    dispatch({
      type: Constants.APPLICATION_FETCH_AUDIENCES_ERROR,
      payload: response.data
    })
  })
}

export const addAudience = (exerciseId, data) => (dispatch) => {
  dispatch({type: Constants.APPLICATION_ADD_AUDIENCE_SUBMITTED});
  return api(schema.audience).post('/api/exercises/' + exerciseId + '/audiences', data).then(function (response) {
    dispatch({
      type: Constants.APPLICATION_ADD_AUDIENCE_SUCCESS,
      payload: response.data
    })
  }).catch(function () {
    dispatch({type: Constants.APPLICATION_ADD_AUDIENCE_ERROR});
    throw new SubmissionError({_error: 'Failed to add audience!'})
  })
}

export const selectAudience = (audienceId) => (dispatch) => {
  dispatch({
    type: Constants.APPLICATION_SELECT_AUDIENCE,
    payload: audienceId
  })
}

export const updateAudience = (exerciseId, audienceId, data) => (dispatch) => {
  dispatch({type: Constants.APPLICATION_UPDATE_AUDIENCE_SUBMITTED});
  return api(schema.audience).put('/api/exercises/' + exerciseId + '/audiences/' + audienceId, data).then(function (response) {
    dispatch({
      type: Constants.APPLICATION_UPDATE_AUDIENCE_SUCCESS,
      payload: response.data
    });
  }).catch(function () {
    dispatch({type: Constants.APPLICATION_UPDATE_AUDIENCE_ERROR});
    throw new SubmissionError({_error: 'Failed to update audience!'})
  })
}

export const deleteAudience = (exerciseId, audienceId) => (dispatch) => {
  dispatch({type: Constants.APPLICATION_DELETE_AUDIENCE_SUBMITTED});
  return api().delete('/api/exercises/' + exerciseId + '/audiences/' + audienceId).then(function (response) {
    dispatch({
      type: Constants.APPLICATION_DELETE_AUDIENCE_SUCCESS,
      payload: Map({
          audienceId: audienceId,
          exerciseId: exerciseId
        }
      )
    })
  }).catch(function () {
    dispatch({type: Constants.APPLICATION_UPDATE_AUDIENCE_ERROR});
    throw new SubmissionError({_error: 'Failed to delete audience!'})
  })
}