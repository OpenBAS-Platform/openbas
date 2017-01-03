import * as Constants from '../constants/ActionTypes'
import Immutable from 'seamless-immutable'
import R from 'ramda'

const app = (state = Immutable({}), action) => {

  switch (action.type) {

    case Constants.IDENTITY_LOGIN_SUCCESS: {
      const token = action.payload.entities.tokens[action.payload.result]
      const user_lang = action.payload.entities.users[token.token_user].user_lang
      var logged = {token: token.token_id, auth: token.token_value, user: token.token_user, lang: user_lang}
      localStorage.setItem('logged', JSON.stringify(logged))
      return state.set('logged', logged)
    }

    case Constants.IDENTITY_LOGOUT_SUCCESS: {
      localStorage.removeItem('logged')
      return state.set('logged', null)
    }

    case Constants.DATA_FETCH_WORKER_STATUS: {
      return state.set('worker', action.payload);
    }

    case Constants.LANG_UPDATE_ON_USER_CHANGE: {
      const user_lang = action.payload.entities.users[action.payload.result].user_lang
      const logged = R.assoc('lang', user_lang, state.logged)
      localStorage.setItem('logged', JSON.stringify(logged))
      return state.set('logged', logged)
    }

    default: {
      return state;
    }
  }
}

export default app;
