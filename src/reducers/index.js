import {combineReducers} from 'redux';
import application from './Application';
import home from './Home';
import {routerReducer} from 'react-router-redux'

const rootReducer = combineReducers({
    application, home, routing: routerReducer
});

export default rootReducer;