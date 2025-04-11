import { List, Map } from 'immutable';
import * as R from 'ramda';

import * as Constants from '../constants/ActionTypes';

export const entitiesInitializer = Map({
  entities: Map({
    files: Map({}),
    users: Map({}),
    groups: Map({}),
    grants: Map({}),
    organizations: Map({}),
    tokens: Map({}),
    exercises: Map({}),
    objectives: Map({}),
    evaluations: Map({}),
    comchecks: Map({}),
    comcheckstatuses: Map({}),
    channelreaders: Map({}),
    challengesreaders: Map({}),
    teams: Map({}),
    injects: Map({}),
    atomics: Map({}),
    atomicdetails: Map({}),
    targetresults: Map({}),
    injector_contracts: Map({}),
    inject_statuses: Map({}),
    communications: Map({}),
    logs: Map({}),
    tags: Map({}),
    documents: Map({}),
    platformParameters: Map({}),
    channels: Map({}),
    payloads: Map({}),
    challenges: Map({}),
    articles: Map({}),
    injectexpectations: Map({}),
    lessonstemplates: Map({}),
    lessonstemplatecategorys: Map({}),
    lessonstemplatequestions: Map({}),
    lessonscategorys: Map({}),
    lessonsquestions: Map({}),
    lessonsanswers: Map({}),
    reports: Map({}),
    variables: Map({}),
    killchainphases: Map({}),
    attackpatterns: Map({}),
    endpoints: Map({}),
    asset_groups: Map({}),
    securityplatforms: Map({}),
    scenarios: Map({}),
    injectors: Map({}),
    collectors: Map({}),
    executors: Map({}),
    mitigations: Map({}),
  }),
});

const mergeDeepOverwriteLists = (a, b) => {
  if (b !== null && a && typeof a === 'object' && typeof a.mergeWith === 'function' && !List.isList(a)) {
    return a.mergeWith(mergeDeepOverwriteLists, b);
  }
  return b;
};

const referential = (state = Map({}), action = {}) => {
  switch (action.type) {
    case Constants.DATA_UPDATE_SUCCESS:
    case Constants.DATA_FETCH_SUCCESS: {
      return mergeDeepOverwriteLists(state, R.dissoc('result', action.payload));
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
