import * as Constants from '../constants/ActionTypes';
import { SubmissionError } from 'redux-form'
import {api} from '../App';
import * as schema from './Schema'

export const fetchAudiences = (exerciseId) => (dispatch) => {
  dispatch({type: Constants.APPLICATION_FETCH_AUDIENCES_SUBMITTED});
  return api(schema.arrayOfAudiences).get('/api/exercises/' + exerciseId + '/audiences').then(function (response) {
    dispatch({
      type: Constants.APPLICATION_FETCH_AUDIENCES_SUCCESS,
      payload: response.data
    })
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
    });
  }).catch(function () {
    throw new SubmissionError({_error: 'Failed to add audience!'})
  })
}
