import * as Constants from '../constants/ActionTypes';
import {Map, fromJS} from 'immutable';

export const application = (state = Map(), action) => {

  switch (action.type) {
    case Constants.APPLICATION_LOGIN_SUBMITTED:
      console.log('APPLICATION_LOGIN_SUBMITTED')
      return state;
    case Constants.APPLICATION_LOGIN_SUCCESS:
      console.log('APPLICATION_LOGIN_SUCCESS')
      return state.set('token', fromJS(action.payload));
    case Constants.APPLICATION_LOGIN_ERROR:
      console.log('APPLICATION_LOGIN_ERROR')
      return state.clear('token');
    case Constants.APPLICATION_LOGOUT_SUCCESS:
      console.log('APPLICATION_LOGOUT_SUCCESS')
      return state.clear('token');
    default:
      return state;
  }
}

export default application;