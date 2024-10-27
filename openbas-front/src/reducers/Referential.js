import * as R from 'ramda';
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
    evaluations: Immutable({}),
    comchecks: Immutable({}),
    comcheckstatuses: Immutable({}),
    channelreaders: Immutable({}),
    challengesreaders: Immutable({}),
    dryruns: Immutable({}),
    dryinjects: Immutable({}),
    teams: Immutable({}),
    injects: Immutable({}),
    atomics: Immutable({}),
    atomicdetails: Immutable({}),
    targetresults: Immutable({}),
    injector_contracts: Immutable({}),
    inject_statuses: Immutable({}),
    communications: Immutable({}),
    logs: Immutable({}),
    tags: Immutable({}),
    documents: Immutable({}),
    platformParameters: Immutable({}),
    channels: Immutable({}),
    payloads: Immutable({}),
    challenges: Immutable({}),
    articles: Immutable({}),
    injectexpectations: Immutable({}),
    lessonstemplates: Immutable({}),
    lessonstemplatecategorys: Immutable({}),
    lessonstemplatequestions: Immutable({}),
    lessonscategorys: Immutable({}),
    lessonsquestions: Immutable({}),
    lessonsanswers: Immutable({}),
    reports: Immutable({}),
    variables: Immutable({}),
    killchainphases: Immutable({}),
    attackpatterns: Immutable({}),
    endpoints: Immutable({}),
    asset_groups: Immutable({}),
    securityplatforms: Immutable({}),
    scenarios: Immutable({}),
    injectors: Immutable({}),
    collectors: Immutable({}),
    executors: Immutable({}),
    mitigations: Immutable({}),
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
