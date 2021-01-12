import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { reducer as formReducer } from 'redux-form';
import app from './App';
import referential from './Referential';
import screen from './Screen';

const createRootReducer = (history) => combineReducers({
  router: connectRouter(history),
  form: formReducer,
  app,
  referential,
  screen,
});
export default createRootReducer;
