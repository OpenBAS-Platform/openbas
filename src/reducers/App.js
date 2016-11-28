import * as Constants from '../constants/ActionTypes'
import Immutable from 'seamless-immutable'

const app = (state = Immutable({}), action) => {

  switch (action.type) {

    case Constants.IDENTITY_LOGIN_SUCCESS: {
      const token = action.payload.entities.tokens[action.payload.result]
      var logged = {token: token.token_id, auth: token.token_value, user: token.token_user}
      localStorage.setItem('logged', JSON.stringify(logged))
      return state.set('logged', logged)
    }

    case Constants.IDENTITY_LOGOUT_SUCCESS: {
      localStorage.removeItem('logged');
      return state.set('logged', null);
    }

    default: {
      return state;
    }
  }
}

export default app;