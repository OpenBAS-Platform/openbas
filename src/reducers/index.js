import {combineReducers} from 'redux';
import counter from './Counter';
import application from './Application';
import {routerReducer} from 'react-router-redux'

const rootReducer = combineReducers({
  counter, application, routing: routerReducer
});

export default rootReducer;