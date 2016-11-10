import * as Constants from '../constants/ActionTypes'
import {Map} from 'immutable'
import {mergeStore} from '../utils/Store'

const application = (state = Map(), action) => {

  switch (action.type) {

    case Constants.APPLICATION_FETCH_EXERCISE_STATUSES_SUCCESS: {
      return state.withMutations(function (state) {
        mergeStore(state, action, ['entities', 'exercise_statuses'])
        state.setIn(['ui', 'loading'], false)
      })
    }

    case Constants.APPLICATION_FETCH_FILES_SUCCESS: {
      return state.withMutations(function (state) {
        mergeStore(state, action, ['entities', 'files'])
        state.setIn(['ui', 'loading'], false)
      })
    }

    case Constants.APPLICATION_ADD_FILE_SUBMITTED: {
      return state.setIn(['ui', 'loading'], true)
    }

    case Constants.APPLICATION_ADD_FILE_SUCCESS: {
      return state.withMutations(function (state) {
        mergeStore(state, action, ['entities', 'files'])
        state.setIn(['ui', 'loading'], false)
      })
    }

    case Constants.APPLICATION_FETCH_USERS_SUBMITTED: {
      return state.setIn(['ui', 'loading'], true)
    }

    case Constants.APPLICATION_FETCH_USERS_SUCCESS: {
      return state.withMutations(function (state) {
        mergeStore(state, action, ['entities', 'users'])
        mergeStore(state, action, ['entities', 'organizations'])
        state.setIn(['ui', 'loading'], false)
      })
    }

    case Constants.APPLICATION_FETCH_USERS_ERROR: {
      return state.setIn(['ui', 'loading'], false)
    }

    case Constants.APPLICATION_SEARCH_USERS_SUBMITTED: {
      return state.setIn(['ui', 'states', 'current_search_keyword'], action.payload)
    }

    case Constants.APPLICATION_ADD_USER_SUBMITTED: {
      return state.setIn(['ui', 'loading'], true)
    }

    case Constants.APPLICATION_ADD_USER_SUCCESS: {
      return state.withMutations(function (state) {
        mergeStore(state, action, ['entities', 'users'])
        mergeStore(state, action, ['entities', 'organizations'])
        state.setIn(['ui', 'loading'], false)
      })
    }

    case Constants.APPLICATION_ADD_USER_ERROR: {
      return state.setIn(['ui', 'loading'], false)
    }

    case Constants.APPLICATION_FETCH_ORGANIZATIONS_SUBMITTED: {
      return state.setIn(['ui', 'loading'], true)
    }

    case Constants.APPLICATION_FETCH_ORGANIZATIONS_SUCCESS: {
      return state.withMutations(function (state) {
        mergeStore(state, action, ['entities', 'organizations'])
        state.setIn(['ui', 'loading'], false)
      })
    }

    case Constants.APPLICATION_FETCH_ORGANIZATIONS_ERROR: {
      return state.setIn(['ui', 'loading'], false)
    }

    case Constants.APPLICATION_ADD_ORGANIZATION_SUBMITTED: {
      return state.setIn(['ui', 'loading'], true)
    }

    case Constants.APPLICATION_ADD_ORGANIZATION_SUCCESS: {
      return state.withMutations(function (state) {
        mergeStore(state, action, ['entities', 'organizations'])
        state.setIn(['ui', 'loading'], false)
      })
    }

    case Constants.APPLICATION_ADD_ORGANIZATION_ERROR: {
      return state.setIn(['ui', 'loading'], false)
    }

    case Constants.APPLICATION_FETCH_EXERCISES_SUBMITTED: {
      return state.setIn(['ui', 'loading'], true)
    }

    case Constants.APPLICATION_FETCH_EXERCISES_SUCCESS: {
      return state.withMutations(function (state) {
        mergeStore(state, action, ['entities', 'exercises'])
        mergeStore(state, action, ['entities', 'exercise_statuses'])
        state.setIn(['ui', 'loading'], false)
      })
    }

    case Constants.APPLICATION_FETCH_EXERCISES_ERROR: {
      return state.setIn(['ui', 'loading'], false)
    }

    case Constants.APPLICATION_FETCH_EXERCISE_SUBMITTED: {
      return state.setIn(['ui', 'loading'], true)
    }

    case Constants.APPLICATION_FETCH_EXERCISE_SUCCESS: {
      return state.withMutations(function (state) {
        mergeStore(state, action, ['entities', 'exercises'])
        mergeStore(state, action, ['entities', 'exercise_statuses'])
        state.setIn(['ui', 'loading'], false)
      })
    }

    case Constants.APPLICATION_FETCH_EXERCISE_ERROR: {
      return state.setIn(['ui', 'loading'], false)
    }

    case Constants.APPLICATION_ADD_EXERCISE_SUBMITTED: {
      return state.setIn(['ui', 'loading'], true)
    }

    case Constants.APPLICATION_ADD_EXERCISE_SUCCESS: {
      return state.withMutations(function (state) {
        mergeStore(state, action, ['entities', 'exercises'])
        state.setIn(['ui', 'loading'], false)
      })
    }

    case Constants.APPLICATION_ADD_EXERCISE_ERROR: {
      return state.setIn(['ui', 'loading'], false)
    }

    case Constants.APPLICATION_UPDATE_EXERCISE_SUBMITTED: {
      return state.setIn(['ui', 'loading'], true)
    }

    case Constants.APPLICATION_UPDATE_EXERCISE_SUCCESS: {
      return state.withMutations(function (state) {
        mergeStore(state, action, ['entities', 'exercises'])
        state.setIn(['ui', 'loading'], false)
      })
    }

    case Constants.APPLICATION_UPDATE_EXERCISE_ERROR: {
      return state.setIn(['ui', 'loading'], false)
    }

    case Constants.APPLICATION_DELETE_EXERCISE_SUCCESS: {
      return state.deleteIn(['entities', 'exercises', action.payload])
    }

    case Constants.APPLICATION_FETCH_AUDIENCES_SUBMITTED: {
      return state.setIn(['ui', 'loading'], true)
    }

    case Constants.APPLICATION_FETCH_AUDIENCES_SUCCESS: {
      return state.withMutations(function (state) {
        mergeStore(state, action, ['entities', 'audiences'])
        state.setIn(['ui', 'loading'], false)
      })
    }

    case Constants.APPLICATION_FETCH_AUDIENCES_ERROR: {
      return state.setIn(['ui', 'loading'], false)
    }

    case Constants.APPLICATION_FETCH_AUDIENCE_SUBMITTED: {
      return state.setIn(['ui', 'loading'], true)
    }

    case Constants.APPLICATION_FETCH_AUDIENCE_SUCCESS: {
      return state.withMutations(function (state) {
        mergeStore(state, action, ['entities', 'audiences'])
        state.setIn(['ui', 'loading'], false)
      })
    }

    case Constants.APPLICATION_FETCH_AUDIENCE_ERROR: {
      return state.setIn(['ui', 'loading'], false)
    }

    case Constants.APPLICATION_ADD_AUDIENCE_SUBMITTED: {
      return state.setIn(['ui', 'loading'], true)
    }

    case Constants.APPLICATION_ADD_AUDIENCE_SUCCESS: {
      let audienceId = action.payload.get('result')
      let exerciseId = action.payload.getIn(['entities', 'audiences', audienceId, 'audience_exercise'])
      return state.withMutations(function (state) {
        mergeStore(state, action, ['entities', 'audiences'])
        state.setIn(['ui', 'loading'], false)
        state.setIn(['ui', 'states', 'current_audiences', exerciseId], action.payload.get('result'))
      })
    }

    case Constants.APPLICATION_ADD_AUDIENCE_ERROR: {
      return state.setIn(['ui', 'loading'], false)
    }

    case Constants.APPLICATION_UPDATE_AUDIENCE_SUBMITTED: {
      return state.setIn(['ui', 'loading'], true)
    }

    case Constants.APPLICATION_UPDATE_AUDIENCE_SUCCESS: {
      console.log('ACTION', action)
      return state.withMutations(function (state) {
        mergeStore(state, action, ['entities', 'audiences'])
        state.setIn(['ui', 'loading'], false)
      })
    }

    case Constants.APPLICATION_UPDATE_AUDIENCE_ERROR: {
      return state.setIn(['ui', 'loading'], false)
    }

    case Constants.APPLICATION_DELETE_AUDIENCE_SUBMITTED: {
      return state.setIn(['ui', 'loading'], true)
    }

    case Constants.APPLICATION_DELETE_AUDIENCE_SUCCESS: {
      return state.withMutations(function (state) {
        state.deleteIn(['entities', 'audiences', action.payload.get('audienceId')])
        state.setIn(['ui', 'states', 'current_audiences', action.payload.get('exerciseId')], undefined)
        state.setIn(['ui', 'loading'], false)
      })
    }

    case Constants.APPLICATION_SELECT_AUDIENCE: {
      return state.setIn(['ui', 'states', 'current_audiences', action.payload.exerciseId], action.payload.audienceId)
    }

    case Constants.APPLICATION_NAVBAR_LEFT_TOGGLE_SUBMITTED: {
      return state.setIn(['ui', 'navbar_left_open'], !state.getIn(['ui', 'navbar_left_open']))
    }

    case Constants.APPLICATION_NAVBAR_RIGHT_TOGGLE_SUBMITTED: {
      return state.setIn(['ui', 'navbar_right_open'], !state.getIn(['ui', 'navbar_right_open']))
    }

    default: {
      return state;
    }
  }
}

export default application;