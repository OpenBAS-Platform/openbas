import * as Constants from '../constants/ActionTypes'
import * as schema from './Schema'
import {push} from 'react-router-redux'
import {postReferential, getReferential, delReferential} from '../utils/Action'

export const askToken = (username, password) => (dispatch) => {
  var data = {login: username, password: password};
  return postReferential(schema.token, '/api/tokens', data)(dispatch).then(data => {
    dispatch({type: Constants.IDENTITY_LOGIN_SUCCESS, payload: data});
  })
}

export const fetchToken = () => (dispatch, getState) => {
  return getReferential(schema.token, '/api/tokens/' + getState().app.logged.token)(dispatch)
}

export const logout = () => (dispatch, getState) => {
  let token_id = getState().app.logged.token
  return delReferential('/api/tokens/' + token_id, 'tokens', token_id)(dispatch).then(() => {
    dispatch({type: Constants.IDENTITY_LOGOUT_SUCCESS});
  })
}

export const toggleLeftBar = () => (dispatch) => {
  dispatch({type: Constants.APPLICATION_NAVBAR_LEFT_TOGGLE_SUBMITTED});
}

export const redirectToHome  = () => (dispatch) => {
  dispatch(push('/'))
}

export const redirectToAdmin  = () => (dispatch) => {
  dispatch(push('/private/admin/index'))
}

export const redirectToExercise  = (exerciseId) => (dispatch) => {
  dispatch(push('/private/exercise/' + exerciseId))
}