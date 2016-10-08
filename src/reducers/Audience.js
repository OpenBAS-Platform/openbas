import * as Constants from '../constants/ActionTypes';
import {Map} from 'immutable';

export const audience = (state = Map(), action) => {

  switch (action.type) {
    case Constants.APPLICATION_FETCH_USERS_SUBMITTED:
      return state.set('loading', true)
    case Constants.APPLICATION_FETCH_USERS_SUCCESS:
      return state.set('loading', false)
    case Constants.APPLICATION_FETCH_USERS_ERROR:
      return state.set('loading', false)
    default:
      return state;
  }
}

export default audience;