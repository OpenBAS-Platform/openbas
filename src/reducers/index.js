import {combineReducers} from 'redux';
import application from './Application';
import identity from './Identity';
import {routerReducer} from 'react-router-redux'
import {reducer as formReducer} from 'redux-form'

const rootReducer = combineReducers({
  application,
  identity,
  routing: routerReducer,
  form: formReducer
});

export default rootReducer;