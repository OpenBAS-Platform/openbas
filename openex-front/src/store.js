import * as R from 'ramda';
import { createBrowserHistory } from 'history';
import { applyMiddleware, compose, createStore } from 'redux';
import { routerMiddleware } from 'connected-react-router';
import thunk from 'redux-thunk';
import { useSelector } from 'react-redux';
import Immutable from 'seamless-immutable';
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

export const history = createBrowserHistory();

const initStore = () => {
  if (process.env.NODE_ENV === 'development' && window.devToolsExtension) {
    return createStore(
      createRootReducer(history),
      initialState,
      compose(
        applyMiddleware(routerMiddleware(history), thunk),
        window.devToolsExtension && window.devToolsExtension(),
      ),
    );
  }
  return createStore(
    createRootReducer(history),
    initialState,
    applyMiddleware(routerMiddleware(history), thunk),
  );
};

// eslint-disable-next-line max-len
export const useHelper = (selector) => useSelector((state) => selector(storeHelper(state)), R.equals);

export const store = initStore();
