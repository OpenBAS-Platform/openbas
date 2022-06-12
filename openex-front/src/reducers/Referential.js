import Immutable from 'seamless-immutable';
import * as R from 'ramda';
import * as Constants from '../constants/ActionTypes';

export const entitiesInitializer = Immutable({
  entities: Immutable({
    files: Immutable({}),
    users: Immutable({}),
    groups: Immutable({}),
    grants: Immutable({}),
    organizations: Immutable({}),
    tokens: Immutable({}),
    exercises: Immutable({}),
    objectives: Immutable({}),
    evaluations: Immutable({}),
    polls: Immutable({}),
    answers: Immutable({}),
    comchecks: Immutable({}),
    comcheckstatuses: Immutable({}),
    mediareaders: Immutable({}),
    dryruns: Immutable({}),
    dryinjects: Immutable({}),
    audiences: Immutable({}),
    injects: Immutable({}),
    inject_types: Immutable({}),
    inject_statuses: Immutable({}),
    communications: Immutable({}),
    logs: Immutable({}),
    tags: Immutable({}),
    documents: Immutable({}),
    parameters: Immutable({}),
  }),
});

const referential = (state = Immutable({}), action = {}) => {
  switch (action.type) {
    case Constants.DATA_UPDATE_SUCCESS:
    case Constants.DATA_FETCH_SUCCESS: {
      return state.merge(R.dissoc('result', action.payload), { deep: true });
    }
    case Constants.DATA_DELETE_SUCCESS: {
      return state.setIn(
        ['entities', action.payload.type],
        R.dissoc(action.payload.id, state.entities[action.payload.type]),
      );
    }
    default: {
      return state;
    }
  }
};

export default referential;
