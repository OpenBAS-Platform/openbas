import Immutable from 'seamless-immutable';
import * as Constants from '../constants/ActionTypes';

const screen = (state = Immutable({}), action) => {
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

    case Constants.APPLICATION_SELECT_SUBAUDIENCE: {
      return state.setIn(
        [
          'exercise',
          action.payload.exercise_id,
          'audience',
          action.payload.audience_id,
          'current_subaudience',
        ],
        action.payload.subaudience_id,
      );
    }

    case Constants.APPLICATION_SELECT_INCIDENT: {
      return state.setIn(
        [
          'exercise',
          action.payload.exercise_id,
          'event',
          action.payload.event_id,
          'current_incident',
        ],
        action.payload.incident_id,
      );
    }

    case Constants.APPLICATION_NAVBAR_LEFT_TOGGLE_SUBMITTED: {
      return state.setIn(['navbar_left_open'], !state.navbar_left_open);
    }

    case Constants.APPLICATION_NAVBAR_RIGHT_TOGGLE_SUBMITTED: {
      return state.setIn(['navbar_right_open'], !state.navbar_right_open);
    }

    default: {
      return state;
    }
  }
};

export default screen;
