import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import app from './App';
import referential from './Referential';
import screen from './Screen';

const createRootReducer = (history) => combineReducers({
  router: connectRouter(history),
  app,
  referential,
  screen,
});
export default createRootReducer;
