import * as Constants from '../constants/ActionTypes'
import Immutable from 'seamless-immutable'

const screen = (state = Immutable({}), action) => {

  switch (action.type) {

    case Constants.DATA_FETCH_SUBMITTED: {
      return state.set('loading', true)
    }

    case Constants.DATA_FETCH_ERROR:
    case Constants.DATA_FETCH_SUCCESS: {
      return state.set('loading', false)
    }

    case Constants.APPLICATION_SELECT_AUDIENCE: {
      return state.setIn(['exercise', action.payload.exercise_id, 'current_audience'], action.payload.audience_id)
    }

    default: {
      return state;
    }
  }
}

export default screen;
