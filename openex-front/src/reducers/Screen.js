import Immutable from 'seamless-immutable';
import * as Constants from '../constants/ActionTypes';

const screen = (state = Immutable({}), action = {}) => {
  switch (action.type) {
    case Constants.DATA_FETCH_SUBMITTED: {
      return state.set('loading', true);
    }

    case Constants.DATA_FETCH_ERROR:
    case Constants.DATA_DELETE_SUCCESS:
    case Constants.DATA_FETCH_SUCCESS: {
      return state.set('loading', false);
    }

    case Constants.DATA_UPDATE_SUCCESS: {
      return state.set('saved', true);
    }

    case Constants.DATA_SAVED_DISMISS: {
      return state.set('saved', false);
    }

    default: {
      return state;
    }
  }
};

export default screen;
