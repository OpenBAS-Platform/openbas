import {combineReducers} from 'redux';
import application from './Application';
import home from './Home';
import {routerReducer} from 'react-router-redux'
import {reducer as formReducer} from 'redux-form'

const rootReducer = combineReducers({
  application,
  home,
  routing: routerReducer,
  form: formReducer
});

export default rootReducer;