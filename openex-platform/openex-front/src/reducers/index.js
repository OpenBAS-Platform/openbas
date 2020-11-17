import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { reducer as formReducer } from 'redux-form';
import app from './App';
import referential from './Referential';
import screen from './Screen';

const rootReducer = combineReducers({
  app,
  referential,
  screen,
  routing: routerReducer,
  form: formReducer,
});

export default rootReducer;
