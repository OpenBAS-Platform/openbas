import {
  APPLICATION_LOGIN_SUBMITTED,
  APPLICATION_LOGIN_SUCCESS,
  APPLICATION_LOGIN_ERROR
} from '../constants/ActionTypes';
import {Map} from 'immutable';

export const application = (state = Map(), action) => {

  switch (action.type) {
    case APPLICATION_LOGIN_SUBMITTED:
      console.log('APPLICATION_LOGIN_SUBMITTED');
      return state;
    case APPLICATION_LOGIN_SUCCESS:
      console.log('APPLICATION_LOGIN_SUCCESS');
      return state;
    case APPLICATION_LOGIN_ERROR:
      console.log('APPLICATION_LOGIN_ERROR');
      return state;
    default:
      return state;
  }
}

export default application;