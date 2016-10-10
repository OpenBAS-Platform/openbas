import * as Constants from '../constants/ActionTypes';
import {api} from '../App';
import * as schema from './Schema'

export const fetchExerciseStatuses = () => (dispatch) => {
  dispatch({type: Constants.APPLICATION_FETCH_EXERCISE_STATUSES_SUBMITTED});
  return api(schema.arrayOfExercisesStatuses).get('/api/exercise_statuses').then(function (response) {
    dispatch({
      type: Constants.APPLICATION_FETCH_EXERCISE_STATUSES_SUCCESS,
      payload: response.data
    })
  }).catch(function (response) {
    dispatch({
      type: Constants.APPLICATION_FETCH_EXERCISE_STATUSES_ERROR,
      payload: response.data
    })
  })
}