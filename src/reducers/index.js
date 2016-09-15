import {combineReducers} from 'redux';
import counter from './Counter';
import application from './Application';

const rootReducer = combineReducers({
  counter, application
});

export default rootReducer;