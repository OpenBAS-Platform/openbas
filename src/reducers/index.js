import {combineReducers} from 'redux';
import application from './Application';
import {routerReducer} from 'react-router-redux'

const rootReducer = combineReducers({
  application, routing: routerReducer
});

export default rootReducer;