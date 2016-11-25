import * as Constants from '../constants/ActionTypes'
import Immutable from 'seamless-immutable'

const referential = (state = Immutable({}), action) => {

  switch (action.type) {

    case Constants.DATA_FETCH_SUBMITTED: {
      return state.set('loading', true)
    }

    case Constants.DATA_FETCH_ERROR: {
      return state.set('loading', false)
    }

    case Constants.APPLICATION_FETCH_AUDIENCES_SUCCESS:
    case Constants.APPLICATION_FETCH_USERS_SUCCESS:
    case Constants.APPLICATION_FETCH_ORGANIZATIONS_SUCCESS:
    case Constants.APPLICATION_ADD_AUDIENCE_SUCCESS:
    case Constants.APPLICATION_ADD_USER_SUCCESS:
    case Constants.APPLICATION_UPDATE_AUDIENCE_SUCCESS:
    case Constants.DATA_FETCH_SUCCESS: {
      console.log("DATA_FETCH_SUCCESS", action.payload)
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