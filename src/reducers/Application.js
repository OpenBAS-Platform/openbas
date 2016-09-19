import * as Constants from '../constants/ActionTypes';
import {Map, fromJS} from 'immutable';

export const application = (state = Map(), action) => {

  function mergeUsers() {
    const users = state.getIn(['entities', 'users']) || Map()
    const mergedUsers = users.mergeDeep(fromJS(action.payload.entities.users))
    return mergedUsers;
  }

  function mergeTokens() {
    const tokens = state.getIn(['entities', 'tokens']) || Map()
    const mergedTokens = tokens.mergeDeep(fromJS(action.payload.entities.tokens))
    return mergedTokens;
  }

  switch (action.type) {
    case Constants.APPLICATION_LOGIN_SUBMITTED:
      return state;

    case Constants.APPLICATION_LOGIN_SUCCESS: {
      var token = fromJS(action.payload.entities.tokens[action.payload.result]);
      return state.withMutations(function (state) {
        state.set('token', action.payload.result.toString())
        state.set('user', token.get('token_user').toString())
        state.setIn(['entities', 'users'], mergeUsers())
        state.setIn(['entities', 'tokens'], mergeTokens())
      })
    }

    case Constants.APPLICATION_LOGIN_ERROR:
      return state.clear('token').clear('user');

    case Constants.APPLICATION_LOGOUT_SUCCESS:
      return state.clear('token').clear('user');

    case Constants.USERS_FETCH_SUCCESS: {
      return state.setIn(['entities', 'users'], mergeUsers())
    }

    default:
      return state;
  }
}

export default application;