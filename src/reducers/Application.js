import * as Constants from '../constants/ActionTypes';
import {Map, fromJS} from 'immutable';

export const application = (state = Map(), action) => {

  switch (action.type) {
    case Constants.APPLICATION_LOGIN_SUBMITTED:
      return state;
    case Constants.APPLICATION_LOGIN_SUCCESS:
      var data = action.payload;
      var token = fromJS(data.entities.tokens[data.result]);
      var user = fromJS(data.entities.users[token.get('token_user')]);
      return state.withMutations(function(state) {
        state.set('token', token)
        state.set('user', user)
      })
    case Constants.APPLICATION_LOGIN_ERROR:
      return state.clear('token').clear('user');
    case Constants.APPLICATION_LOGOUT_SUCCESS:
      return state.clear('token').clear('user');
    default:
      return state;
  }
}

export default application;