import * as Constants from '../constants/ActionTypes';
import {Map, fromJS} from 'immutable';

export const users = (state = Map(), action) => {

  switch (action.type) {
    case Constants.USERS_FETCH_SUBMITTED:
      return state.set('loading', true);
    case Constants.USERS_FETCH_SUCCESS:
      return state.withMutations(function (state) {
        state.set('data', fromJS(action.payload.entities.users))
        state.set('loading', false);
      })
    case Constants.USERS_FETCH_ERROR:
      return state.set('loading', false);
    default:
      return state;
  }
}

export default users;