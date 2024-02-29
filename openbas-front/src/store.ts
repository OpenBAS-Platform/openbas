import * as R from 'ramda';
import { createBrowserHistory } from 'history';
import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import { useSelector } from 'react-redux';
import Immutable from 'seamless-immutable';
import { createReduxHistoryContext } from 'redux-first-history';
import { composeWithDevTools } from '@redux-devtools/extension';
import createRootReducer from './reducers/Root';
import { entitiesInitializer } from './reducers/Referential';
import { storeHelper } from './actions/Schema';

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
export const useHelper = (selector: any) => useSelector((state) => selector(storeHelper(state)), R.equals);

export const store = initStore();

export const history = createReduxHistory(store);
