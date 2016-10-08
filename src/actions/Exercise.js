import * as Constants from '../constants/ActionTypes';
import { SubmissionError } from 'redux-form'
import {api} from '../App';
import * as schema from './Schema'

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

export const fetchExercise = () => (dispatch, getState) => {
  let exercise_id = getState().application.get('exercise');
  dispatch({type: Constants.APPLICATION_FETCH_EXERCISE_SUBMITTED});
  return api().get('/api/exercises/' + exercise_id).then(function (response) {
    dispatch({
      type: Constants.APPLICATION_FETCH_EXERCISE_SUBMITTED,
      payload: response.data
    });
  }).catch(function (response) {
    console.error(response)
    dispatch({type: Constants.APPLICATION_FETCH_EXERCISE_SUBMITTED});
  })
}

export const addExercise = (data) => (dispatch) => {
  dispatch({type: Constants.APPLICATION_ADD_EXERCISE_SUBMITTED});
  var postData = {
    exercise_name: data.name,
    exercise_subtitle: data.subtitle,
    exercise_organizer: data.organizer,
    exercise_description: data.description,
    exercise_start_date: data.startDate + ' ' + data.startTime,
    exercise_end_date: data.endDate + ' ' + data.endTime,
  };
  console.log("POSTDATA: ")
  console.log(postData)
  return api(schema.token).post('/api/exercises', postData).then(function (response) {
    // add the result in the entities

    dispatch({
      type: Constants.APPLICATION_ADD_EXERCISE_SUCCESS,
      payload: response.data
    });
  }).catch(function () {
    throw new SubmissionError({_error: 'Failed to add exercise!'})
  })
}