import { composeWithDevTools } from '@redux-devtools/extension';
import { createBrowserHistory } from 'history';
import * as R from 'ramda';
import { useSelector } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import { createReduxHistoryContext } from 'redux-first-history';
import { thunk } from 'redux-thunk';
import Immutable from 'seamless-immutable';

import { storeHelper } from './actions/Schema';
import { entitiesInitializer } from './reducers/Referential';
import createRootReducer from './reducers/Root';

// Default application state
const initialState = {
  app: Immutable({
    logged: {},
    worker: { status: 'RUNNING' },
  }),
  referential: entitiesInitializer,
};

const { createReduxHistory, routerMiddleware, routerReducer } = createReduxHistoryContext({
  history: createBrowserHistory(),
});

const initStore = () => {
  if (process.env.NODE_ENV === 'development') {
    return createStore(
      createRootReducer(routerReducer),
      initialState,
      composeWithDevTools(applyMiddleware(routerMiddleware, thunk)),
    );
  }
  return createStore(
    createRootReducer(routerReducer),
    initialState,
    applyMiddleware(routerMiddleware, thunk),
  );
};

// TODO type selector object
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useHelper = (selector: any) => useSelector(state => selector(storeHelper(state)), R.equals);

export const store = initStore();

export const history = createReduxHistory(store);
