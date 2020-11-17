import Immutable from 'seamless-immutable';
import * as R from 'ramda';
import * as Constants from '../constants/ActionTypes';

const app = (state = Immutable({}), action) => {
  switch (action.type) {
    case Constants.IDENTITY_LOGIN_SUCCESS: {
      const token = action.payload.entities.tokens[action.payload.result];
      const { user_lang } = action.payload.entities.users[token.token_user];
      const { user_admin } = action.payload.entities.users[token.token_user];
      const logged = {
        token: token.token_id,
        auth: token.token_value,
        user: token.token_user,
        lang: user_lang,
        admin: user_admin,
      };
      localStorage.setItem('logged', JSON.stringify(logged));
      return state.set('logged', logged);
    }

    case Constants.IDENTITY_LOGOUT_SUCCESS: {
      localStorage.removeItem('logged');
      return state.set('logged', null);
    }

    case Constants.DATA_FETCH_WORKER_STATUS: {
      return state.set('worker', action.payload);
    }

    case Constants.LANG_UPDATE_ON_USER_CHANGE: {
      const { user_lang } = action.payload.entities.users[action.payload.result];
      const logged = R.assoc('lang', user_lang, state.logged);
      localStorage.setItem('logged', JSON.stringify(logged));
      return state.set('logged', logged);
    }

    default: {
      return state;
    }
  }
};

export default app;
