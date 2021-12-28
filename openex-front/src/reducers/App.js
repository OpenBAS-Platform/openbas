import Immutable from 'seamless-immutable';
import * as R from 'ramda';
import * as Constants from '../constants/ActionTypes';

const app = (state = Immutable({}), action = {}) => {
  switch (action.type) {
    case Constants.IDENTITY_LOGIN_SUCCESS: {
      const user = action.payload.entities.users[action.payload.result];
      const logged = {
        user: user.user_id,
        lang: user.user_lang,
        theme: user.user_theme,
        admin: user.user_admin,
      };
      return state.set('logged', logged);
    }

    case Constants.DATA_FETCH_ERROR: {
      if (action.payload.status === 401) {
        // If unauthorized, force logout
        return state.set('logged', null);
      }
      return state;
    }

    case Constants.IDENTITY_LOGOUT_SUCCESS: {
      return state.set('logged', null);
    }

    case Constants.DATA_FETCH_WORKER_STATUS: {
      return state.set('worker', action.payload);
    }

    case Constants.LANG_UPDATE_ON_USER_CHANGE: {
      const { user_lang: userLang } = action.payload.entities.users[action.payload.result];
      const logged = R.assoc('lang', userLang, state.logged);
      return state.set('logged', logged);
    }

    default: {
      return state;
    }
  }
};

export default app;
