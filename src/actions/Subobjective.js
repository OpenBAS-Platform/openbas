import * as Constants from '../constants/ActionTypes';
import {SubmissionError} from 'redux-form'
import {api} from '../App';
import * as schema from './Schema'
import {Map} from 'immutable'

export const fetchSubobjectives = (exerciseId, objectiveId) => (dispatch) => {
  dispatch({type: Constants.APPLICATION_FETCH_SUBOBJECTIVES_SUBMITTED});
  return api(schema.arrayOfSubobjectives).get('/api/exercises/' + exerciseId + '/objectives/' + objectiveId + '/subobjectives').then(function (response) {
    dispatch({
      type: Constants.APPLICATION_FETCH_SUBOBJECTIVES_SUCCESS,
      payload: response.data
    })
  }).catch(function (response) {
    dispatch({
      type: Constants.APPLICATION_FETCH_SUBOBJECTIVES_ERROR,
      payload: response.data
    })
  })
}

export const addSubobjective = (exerciseId, objectiveId, data) => (dispatch) => {
  dispatch({type: Constants.APPLICATION_ADD_SUBOBJECTIVE_SUBMITTED});
  return api(schema.subobjective).post('/api/exercises/' + exerciseId + '/objectives/' + objectiveId + '/subobjectives', data).then(function (response) {
    dispatch({
      type: Constants.APPLICATION_ADD_SUBOBJECTIVE_SUCCESS,
      payload: response.data
    })
  })
}

export const updateSubobjective = (exerciseId, objectiveId, subobjectiveId, data) => (dispatch) => {
  dispatch({type: Constants.APPLICATION_UPDATE_SUBOBJECTIVE_SUBMITTED});
  return api(schema.subobjective).put('/api/exercises/' + exerciseId + '/objectives/' + objectiveId + '/subobjectives/' + subobjectiveId, data).then(function (response) {
    dispatch({
      type: Constants.APPLICATION_UPDATE_SUBOBJECTIVE_SUCCESS,
      payload: response.data
    });
  }).catch(function () {
    dispatch({type: Constants.APPLICATION_UPDATE_SUBOBJECTIVE_ERROR});
    throw new SubmissionError({_error: 'Failed to update subobjective!'})
  })
}

export const deleteSubobjective = (exerciseId, objectiveId, subobjectiveId) => (dispatch) => {
  dispatch({type: Constants.APPLICATION_DELETE_SUBOBJECTIVE_SUBMITTED});
  return api().delete('/api/exercises/' + exerciseId + '/objectives/' + objectiveId + '/subobjectives/' + subobjectiveId).then(function (response) {
    dispatch({
      type: Constants.APPLICATION_DELETE_SUBOBJECTIVE_SUCCESS,
      payload: Map({
          subobjectiveId: subobjectiveId,
          objectiveId: objectiveId,
          exerciseId: exerciseId
        }
      )
    })
  }).catch(function () {
    dispatch({type: Constants.APPLICATION_DELETE_SUBOBJECTIVE_ERROR});
    throw new SubmissionError({_error: 'Failed to delete subobjective!'})
  })
}