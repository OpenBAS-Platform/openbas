import * as Constants from '../constants/ActionTypes'
import {Map} from 'immutable'
import {mergeStore} from '../utils/Store'

const identity = (state = Map(), action) => {

  switch (action.type) {
    case Constants.APPLICATION_LOGIN_SUBMITTED: {
      return state;
    }

    case Constants.APPLICATION_LOGIN_SUCCESS: {
      var result = action.payload.get('result').toString();
      var token = action.payload.getIn(['entities', 'tokens', result]);
      return state.withMutations(function (state) {
        state.set('token', result)
        state.set('user', token.get('token_user').toString())
        mergeStore(state, action, ['entities', 'users'])
        mergeStore(state, action, ['entities', 'tokens'])
      })
    }

    case Constants.APPLICATION_LOGIN_ERROR: {
      return state.set('token', null);
    }

    case Constants.APPLICATION_LOGOUT_SUCCESS: {
      return state.set('token', null);
    }

    default: {
      return state;
    }
  }
}

export default identity;