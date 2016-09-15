import {
  APPLICATION_LOGIN_SUBMITTED,
  APPLICATION_LOGIN_SUCCESS,
  APPLICATION_LOGIN_ERROR
} from '../constants/ActionTypes';
import axios from 'axios';

export const askToken = (username, password) => (dispatch) => {
  dispatch({type: APPLICATION_LOGIN_SUBMITTED});
  return axios({
    url: '/api/tokens',
    timeout: 20000,
    method: 'post',
    responseType: 'json',
    data: {
      login: username,
      password: password
    }
  }).then(function (response) {
    dispatch({
      type: APPLICATION_LOGIN_SUCCESS,
      data: response.data
    });
  }).catch(function (response) {
    dispatch({
      type: APPLICATION_LOGIN_ERROR,
      data: null
    });
  })
}