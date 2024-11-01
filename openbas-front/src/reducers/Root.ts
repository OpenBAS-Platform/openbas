import { combineReducers } from 'redux';
import { IHistoryContext } from 'redux-first-history';

import app from './App';
import referential from './Referential';

const createRootReducer = (routerReducer: IHistoryContext['routerReducer']) => combineReducers({
  router: routerReducer,
  app,
  referential,
});
export default createRootReducer;
