import Immutable from 'seamless-immutable';
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
    subobjectives: Immutable({}),
    comchecks: Immutable({}),
    comchecks_statuses: Immutable({}),
    dryruns: Immutable({}),
    dryinjects: Immutable({}),
    audiences: Immutable({}),
    subaudiences: Immutable({}),
    events: Immutable({}),
    incidents: Immutable({}),
    incident_types: Immutable({}),
    injects: Immutable({}),
    inject_types: Immutable({}),
    inject_statuses: Immutable({}),
    logs: Immutable({}),
    planificateurs_audiences: Immutable({}),
    planificateurs_events: Immutable({}),
    tag: Immutable({}),
    documents: Immutable({}),
    outcomes: Immutable({}),
    parmeters: Immutable({}),
  }),
});

const referential = (state = Immutable({}), action) => {
  switch (action.type) {
    case Constants.DATA_FETCH_SUCCESS: {
      return state.merge(action.payload.without('result'), { deep: true });
    }

    case Constants.DATA_DELETE_SUCCESS: {
      return state.setIn(
        ['entities', action.payload.type],
        state.entities[action.payload.type].without(action.payload.id),
      );
    }

    default: {
      return state;
    }
  }
};

export default referential;
