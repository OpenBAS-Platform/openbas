import * as Constants from '../constants/ActionTypes'
import Immutable from 'seamless-immutable'

const referential = (state = Immutable({}), action) => {

  switch (action.type) {
    case Constants.DATA_FETCH_SUCCESS: {
      return state.merge(action.payload.without('result'), {deep: true})
    }

    case Constants.DATA_DELETE_SUCCESS: {
      return state.setIn(['entities', action.payload.type], state.entities[action.payload.type]
        .without(action.payload.id))
    }

    default: {
      return state;
    }
  }
}

export default referential;
