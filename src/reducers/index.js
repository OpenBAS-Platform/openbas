import { combineReducers } from 'redux';
import counter from './Counter';

const rootReducer = combineReducers({
  counter
});

export default rootReducer;