import { combineReducers } from 'redux-immutable';
import counter from './Counter';

const rootReducer = combineReducers({
  counter
});

export default rootReducer;