import * as Constants from '../constants/ActionTypes';
import {SubmissionError} from 'redux-form'
import {api} from '../App';
import * as schema from './Schema'
import {Map} from 'immutable'

export const fetchObjectives = (exerciseId) => (dispatch) => {
  dispatch({type: Constants.APPLICATION_FETCH_OBJECTIVES_SUBMITTED});
  return api(schema.arrayOfObjectives).get('/api/exercises/' + exerciseId + '/objectives').then(function (response) {
    dispatch({
      type: Constants.APPLICATION_FETCH_OBJECTIVES_SUCCESS,
      payload: response.data
    })
  }).catch(function (response) {
    dispatch({
      type: Constants.APPLICATION_FETCH_OBJECTIVES_ERROR,
      payload: response.data
    })
  })
}

export const addObjective = (exerciseId, data) => (dispatch) => {
  dispatch({type: Constants.APPLICATION_ADD_OBJECTIVE_SUBMITTED});
  return api(schema.objective).post('/api/exercises/' + exerciseId + '/objectives', data).then(function (response) {
    dispatch({
      type: Constants.APPLICATION_ADD_OBJECTIVE_SUCCESS,
      payload: response.data
    })
  }).catch(function () {
    dispatch({type: Constants.APPLICATION_ADD_OBJECTIVE_ERROR});
    throw new SubmissionError({_error: 'Failed to add objective!'})
  })
}

export const updateObjective = (exerciseId, objectiveId, data) => (dispatch) => {
  dispatch({type: Constants.APPLICATION_UPDATE_OBJECTIVE_SUBMITTED});
  return api(schema.objective).put('/api/exercises/' + exerciseId + '/objectives/' + objectiveId, data).then(function (response) {
    dispatch({
      type: Constants.APPLICATION_UPDATE_OBJECTIVE_SUCCESS,
      payload: response.data
    });
  }).catch(function () {
    dispatch({type: Constants.APPLICATION_UPDATE_OBJECTIVE_ERROR});
    throw new SubmissionError({_error: 'Failed to update objective!'})
  })
}

export const deleteObjective = (exerciseId, objectiveId) => (dispatch) => {
  dispatch({type: Constants.APPLICATION_DELETE_OBJECTIVE_SUBMITTED});
  return api().delete('/api/exercises/' + exerciseId + '/objectives/' + objectiveId).then(function (response) {
    dispatch({
      type: Constants.APPLICATION_DELETE_OBJECTIVE_SUCCESS,
      payload: Map({
          objectiveId: objectiveId,
          exerciseId: exerciseId
        }
      )
    })
  }).catch(function () {
    dispatch({type: Constants.APPLICATION_DELETE_OBJECTIVE_ERROR});
    throw new SubmissionError({_error: 'Failed to delete objective!'})
  })
}