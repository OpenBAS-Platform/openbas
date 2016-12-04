import * as schema from './Schema'
import {getReferential, postReferential, putReferential, delReferential} from '../utils/Action'

export const fetchUsers = () => (dispatch) => {
  return getReferential(schema.arrayOfUsers, '/api/users')(dispatch)
}

export const fetchCurrentUser = () => (dispatch, getState) => {
  return getReferential(schema.user, '/api/users/' + getState().app.logged.user)(dispatch)
}

export const addUser = (data) => (dispatch) => {
  return postReferential(schema.user, '/api/users', data)(dispatch)
}

export const updateUser = (userId, data) => (dispatch) => {
  return putReferential(schema.user, '/api/users/' + userId, data)(dispatch)
}

export const deleteUser = (userId) => (dispatch) => {
  return delReferential('/api/users/' + userId, 'users', userId)(dispatch)
}