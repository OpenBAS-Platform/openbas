import {combineReducers} from 'redux';
import application from './Application';
import users from './Users';
import {routerReducer} from 'react-router-redux'

const rootReducer = combineReducers({
  application, users, routing: routerReducer
});

export default rootReducer;