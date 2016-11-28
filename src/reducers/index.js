import {combineReducers} from 'redux';
import application from './Application';
import app from './App';
import referential from './Referential';
import screen from './Screen';
import {routerReducer} from 'react-router-redux'
import {reducer as formReducer} from 'redux-form'

const rootReducer = combineReducers({
  app,
  application,
  referential,
  screen,
  routing: routerReducer,
  form: formReducer
});

export default rootReducer;