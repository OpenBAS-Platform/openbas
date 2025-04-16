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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mergeDeepOverwriteLists = (a: any, b: any) => {
  // First, check if 'b' is null to avoid overwriting 'a', even if 'a' is mergeable.
  // Then, check if 'a' is mergeable.
  if (b !== null && a && typeof a === 'object' && typeof a.mergeWith === 'function' && !List.isList(a)) {
    return a.mergeWith(mergeDeepOverwriteLists, b);
  }
  return b;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const referential = (state: any = Map({}), action: any = {}) => {
  switch (action.type) {
    case Constants.DATA_UPDATE_SUCCESS:
    case Constants.DATA_FETCH_SUCCESS: {
      return mergeDeepOverwriteLists(state, R.dissoc('result', action.payload));
    }
    case Constants.DATA_DELETE_SUCCESS: {
      return state.setIn(
        ['entities', action.payload.type],
        state.getIn(['entities', action.payload.type]).delete(action.payload.id),
      );
    }
    default: {
      return state;
    }
  }
};

export default referential;
