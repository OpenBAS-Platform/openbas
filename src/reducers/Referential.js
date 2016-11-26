import * as Constants from '../constants/ActionTypes'
import Immutable from 'seamless-immutable'

const referential = (state = Immutable({}), action) => {

  switch (action.type) {

    case Constants.APPLICATION_FETCH_AUDIENCES_SUCCESS:
    case Constants.APPLICATION_FETCH_USERS_SUCCESS:
    case Constants.APPLICATION_FETCH_ORGANIZATIONS_SUCCESS:
    case Constants.APPLICATION_FETCH_EVENTS_SUCCESS:
    case Constants.APPLICATION_FETCH_INJECTS_SUCCESS:
    case Constants.APPLICATION_FETCH_INCIDENTS_SUCCESS:
    case Constants.APPLICATION_FETCH_INCIDENT_TYPES_SUCCESS:
    case Constants.APPLICATION_ADD_AUDIENCE_SUCCESS:
    case Constants.APPLICATION_ADD_USER_SUCCESS:
    case Constants.APPLICATION_ADD_INCIDENT_SUCCESS:
    case Constants.APPLICATION_UPDATE_AUDIENCE_SUCCESS:
    case Constants.APPLICATION_UPDATE_INCIDENT_SUCCESS:
    case Constants.APPLICATION_UPDATE_USER_SUCCESS:
    case Constants.DATA_FETCH_SUCCESS: {
      let payload = Immutable(action.payload.toJS())
      return state.set('loading', false).merge(payload.without('result'), {deep: true})
    }

    case Constants.APPLICATION_DELETE_AUDIENCE_SUCCESS:
    case Constants.DATA_DELETE_SUCCESS: {
      let payload = Immutable(action.payload.toJS())
      return state.setIn(['entities', payload.type], state.entities[payload.type].without(payload.id))
    }

    default: {
      return state;
    }
  }
}

export default referential;
