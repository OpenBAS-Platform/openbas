import { composeWithDevTools } from '@redux-devtools/extension';
import { fromJS, isImmutable } from 'immutable';
import * as R from 'ramda';
import { useSelector } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import { thunk } from 'redux-thunk';

import { storeHelper } from './actions/Schema';
import { entitiesInitializer } from './reducers/Referential';
import createRootReducer from './reducers/Root';

// Default application state
const initialState = {
  app: fromJS({
    logged: {},
    worker: { status: 'RUNNING' },
  }),
  referential: entitiesInitializer,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

const initStore = () => {
  if (process.env.NODE_ENV === 'development') {
    return createStore(
      createRootReducer(),
      initialState,
      composeWithDevTools(applyMiddleware(thunk)),
    );
  }
  return createStore(
    createRootReducer(),
    initialState,
    applyMiddleware(thunk),
  );
};

// TODO type selector object
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useHelper = (selector: any) => (() => {
  const selected = useSelector(state => selector(storeHelper(state)), R.equals);

  if (!selected) {
    return selected;
  }

  if (isImmutable(selected)) {
    return selected.toJS();
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: Record<string, any> = {};
  for (const key in selected) {
    if (Object.prototype.hasOwnProperty.call(selected, key)) {
      if (selected[key] && isImmutable(selected[key])) {
        result[key] = selected[key].toJS();
      } else {
        result[key] = selected[key];
      }
    }
  }
  return result;
})();

export const store = initStore();
