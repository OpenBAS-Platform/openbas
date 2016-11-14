import * as Constants from '../constants/ActionTypes';
import {SubmissionError} from 'redux-form'
import {api} from '../App';
import * as schema from './Schema'
import {push} from 'react-router-redux'

export const fetchExercises = () => (dispatch) => {
  dispatch({type: Constants.APPLICATION_FETCH_EXERCISES_SUBMITTED});
  return api(schema.arrayOfExercises).get('/api/exercises').then(function (response) {
    dispatch({
      type: Constants.APPLICATION_FETCH_EXERCISES_SUCCESS,
      payload: response.data
    })
  }).catch(function (response) {
    dispatch({
      type: Constants.APPLICATION_FETCH_EXERCISES_ERROR,
      payload: response.data
    })
  })
}

export const fetchExercise = (exerciseId) => (dispatch) => {
  dispatch({type: Constants.APPLICATION_FETCH_EXERCISE_SUBMITTED});
  return api(schema.exercise).get('/api/exercises/' + exerciseId).then(function (response) {
    dispatch({
      type: Constants.APPLICATION_FETCH_EXERCISE_SUCCESS,
      payload: response.data
    });
  }).catch(function (response) {
    console.error(response)
    dispatch({type: Constants.APPLICATION_FETCH_EXERCISE_ERROR});
  })
}

export const addExercise = (data) => (dispatch) => {
  dispatch({type: Constants.APPLICATION_ADD_EXERCISE_SUBMITTED});
  return api(schema.exercise).post('/api/exercises', data).then(function (response) {
    dispatch({
      type: Constants.APPLICATION_ADD_EXERCISE_SUCCESS,
      payload: response.data
    });
  })
}

export const updateExercise = (exerciseId, data) => (dispatch) => {
  dispatch({type: Constants.APPLICATION_UPDATE_EXERCISE_SUBMITTED});
  return api(schema.exercise).put('/api/exercises/' + exerciseId, data).then(function (response) {
    dispatch({
      type: Constants.APPLICATION_UPDATE_EXERCISE_SUCCESS,
      payload: response.data
    });
  }).catch(function () {
    dispatch({type: Constants.APPLICATION_UPDATE_EXERCISE_ERROR});
    throw new SubmissionError({_error: 'Failed to update exercise!'})
  })
}

export const deleteExercise = (exerciseId) => (dispatch) => {
  dispatch({type: Constants.APPLICATION_DELETE_EXERCISE_SUBMITTED});
  return api().delete('/api/exercises/' + exerciseId).then(function (response) {
    dispatch({
      type: Constants.APPLICATION_DELETE_EXERCISE_SUCCESS,
      payload: exerciseId
    });
    dispatch(push('/private'))
  }).catch(function () {
    dispatch({type: Constants.APPLICATION_DELETE_EXERCISE_ERROR});
    throw new SubmissionError({_error: 'Failed to delete exercise!'})
  })
}