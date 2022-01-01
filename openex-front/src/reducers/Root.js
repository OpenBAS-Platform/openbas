import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import app from './App';
import referential from './Referential';

const createRootReducer = (history) => combineReducers({
  router: connectRouter(history),
  app,
  referential,
});
export default createRootReducer;
