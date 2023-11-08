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
  // eslint-disable-next-line no-underscore-dangle
  if (process.env.NODE_ENV === 'development' && window.__REDUX_DEVTOOLS_EXTENSION__) {
    return createStore(
      createRootReducer(history),
      initialState,
      compose(
        applyMiddleware(routerMiddleware(history), thunk),
        // eslint-disable-next-line no-underscore-dangle
        window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
      ),
    );
  }
  return createStore(
    createRootReducer(history),
    initialState,
    applyMiddleware(routerMiddleware(history), thunk),
  );
};

export const useHelper = (selector) => useSelector((state) => selector(storeHelper(state)), R.equals);

export const store = initStore();
