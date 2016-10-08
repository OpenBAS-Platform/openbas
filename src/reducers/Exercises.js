import * as Constants from '../constants/ActionTypes';
import {Map} from 'immutable';

export const exercises = (state = Map(), action) => {

  switch (action.type) {
    case Constants.APPLICATION_FETCH_EXERCISES_SUBMITTED:
      return state.set('loading', true)
    case Constants.APPLICATION_FETCH_EXERCISES_SUCCESS:
      return state.set('loading', false)
    case Constants.APPLICATION_FETCH_EXERCISES_ERROR:
      return state.set('loading', false)
    default:
      return state;
  }
}

export default exercises;