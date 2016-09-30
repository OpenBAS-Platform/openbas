import * as Constants from '../constants/ActionTypes';
import {Map} from 'immutable';

export const application = (state = Map(), action) => {

  function mergeUsers() {
    const users = state.getIn(['entities', 'users']) || Map()
    const mergedUsers = users.mergeDeep(action.payload.getIn(['entities', 'users']))
    return mergedUsers;
  }

  function mergeTokens() {
    const tokens = state.getIn(['entities', 'tokens']) || Map()
    const mergedTokens = tokens.mergeDeep(action.payload.getIn(['entities', 'tokens']))
    return mergedTokens;
  }

  switch (action.type) {
    case Constants.APPLICATION_LOGIN_SUBMITTED:
      return state;

    case Constants.APPLICATION_LOGIN_SUCCESS: {
      var result = action.payload.get('result').toString();
      var token = action.payload.getIn(['entities', 'tokens', result]);
      return state.withMutations(function (state) {
        state.set('token', result)
        state.set('user', token.get('token_user').toString())
        state.setIn(['entities', 'users'], mergeUsers())
        state.setIn(['entities', 'tokens'], mergeTokens())
      })
    }

    case Constants.APPLICATION_LOGIN_ERROR:
      return state.set('token', null);

    case Constants.APPLICATION_LOGOUT_SUCCESS:
      return state.set('token', null);

    case Constants.APPLICATION_USERS_FETCH_SUCCESS: {
      return state.setIn(['entities', 'users'], mergeUsers())
    }

    default:
      return state;
  }
}

export default application;