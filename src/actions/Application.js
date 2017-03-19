import * as Constants from '../constants/ActionTypes'
import * as schema from './Schema'
import {push} from 'react-router-redux'
import {api} from '../App'
import {postReferential, getReferential, delReferential} from '../utils/Action'

export const askToken = (username, password) => (dispatch) => {
  const data = {login: username, password: password};
  return postReferential(schema.token, '/api/tokens', data)(dispatch).then(data => {
    dispatch({type: Constants.IDENTITY_LOGIN_SUCCESS, payload: data});
  })  
}

export const fetchToken = () => (dispatch, getState) => {
  return getReferential(schema.token, '/api/tokens/' + getState().app.logged.token)(dispatch)
}

export const fetchWorkerStatus = () => (dispatch) => {
  return api().get('/api/worker_status').then(function (response) {
    dispatch({type: Constants.DATA_FETCH_WORKER_STATUS, payload: response.data})
  }).catch(function () {
    dispatch({type: Constants.DATA_FETCH_WORKER_STATUS, payload: {status: 'ERROR'}});
  })
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

export const savedDismiss = () => (dispatch) => {
  dispatch({type: Constants.DATA_SAVED_DISMISS});
}

export const redirectToHome  = () => (dispatch) => {
  dispatch(push('/'))
}

export const redirectToAdmin  = () => (dispatch) => {
  dispatch(push('/private/admin/index'))
}

export const redirectToExercise = (exerciseId) => (dispatch) => {
  dispatch(push('/private/exercise/' + exerciseId))
}

export const redirectToScenario = (exerciseId) => (dispatch) => {
  dispatch(push('/private/exercise/' + exerciseId + '/scenario'))
}

export const redirectToAudiences = (exerciseId) => (dispatch) => {
  dispatch(push('/private/exercise/' + exerciseId + '/audiences'))
}

export const redirectToEvent = (exerciseId, eventId) => (dispatch) => {
  dispatch(push('/private/exercise/' + exerciseId + '/scenario/' + eventId))
}

export const redirectToChecks = (exerciseId) => (dispatch) => {
  dispatch(push('/private/exercise/' + exerciseId + '/checks'))
}

export const redirectToComcheck = (exerciseId, comcheckId) => (dispatch) => {
  dispatch(push('/private/exercise/' + exerciseId + '/checks/comcheck/' + comcheckId))
}

export const redirectToDryrun = (exerciseId, dryrunId) => (dispatch) => {
  dispatch(push('/private/exercise/' + exerciseId + '/checks/dryrun/' + dryrunId))
}