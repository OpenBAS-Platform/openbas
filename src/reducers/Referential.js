import * as Constants from '../constants/ActionTypes'
import Immutable from 'seamless-immutable'

const referential = (state = Immutable({}), action) => {

  switch (action.type) {

    case Constants.APPLICATION_FETCH_ORGANIZATIONS_SUCCESS:
    case Constants.APPLICATION_FETCH_EVENTS_SUCCESS:
    case Constants.APPLICATION_FETCH_INJECTS_SUCCESS:
    case Constants.APPLICATION_FETCH_INCIDENTS_SUCCESS:
    case Constants.APPLICATION_FETCH_INCIDENT_TYPES_SUCCESS:
    case Constants.APPLICATION_ADD_INCIDENT_SUCCESS:
    case Constants.APPLICATION_UPDATE_INCIDENT_SUCCESS:
    case Constants.DATA_FETCH_SUCCESS: {
      let payload = Immutable(action.payload.toJS())
      return state.merge(payload.without('result'), {deep: true})
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
