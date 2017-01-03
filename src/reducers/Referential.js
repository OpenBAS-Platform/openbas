import * as Constants from '../constants/ActionTypes'
import Immutable from 'seamless-immutable'

export const entitiesInitializer =
  Immutable({
    entities: Immutable({
      files: Immutable({}),
      users: Immutable({}),
      groups: Immutable({}),
      grants: Immutable({}),
      organizations: Immutable({}),
      tokens: Immutable({}),
      exercises: Immutable({}),
      objectives: Immutable({}),
      subobjectives: Immutable({}),
      comchecks: Immutable({}),
      comchecks_statuses: Immutable({}),
      dryruns: Immutable({}),
      dryinjects: Immutable({}),
      audiences: Immutable({}),
      events: Immutable({}),
      incidents: Immutable({}),
      injects: Immutable({}),
      inject_types: Immutable({}),
      inject_statuses: Immutable({}),
      logs: Immutable({}),
      outcomes: Immutable({})
    })
  })

const referential = (state = Immutable({}), action) => {
  switch (action.type) {

    case Constants.IDENTITY_LOGIN_SUCCESS: {
      return entitiesInitializer
    }

    case Constants.DATA_FETCH_SUCCESS: {
      return state.merge(action.payload.without('result'), {deep: true})
    }

    case Constants.DATA_DELETE_SUCCESS: {
      return state.setIn(['entities', action.payload.type], state.entities[action.payload.type]
        .without(action.payload.id))
    }

    default: {
      return state
    }
  }
}

export default referential
