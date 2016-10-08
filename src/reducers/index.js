import {combineReducers} from 'redux';
import application from './Application';
import {routerReducer} from 'react-router-redux'
import {reducer as formReducer} from 'redux-form'

const rootReducer = combineReducers({
  application,
  routing: routerReducer,
  form: formReducer
});

export default rootReducer;