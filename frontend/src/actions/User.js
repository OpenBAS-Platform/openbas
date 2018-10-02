import * as schema from './Schema'
import * as Constants from '../constants/ActionTypes'
import {getReferential, postReferential, putReferential, delReferential} from '../utils/Action'

export const fetchUsers = () => (dispatch) => {
    return getReferential(schema.arrayOfUsers, '/api/users')(dispatch)
}

export const addUser = (data) => (dispatch) => {
    return postReferential(schema.user, '/api/users', data)(dispatch)
}

export const updateUser = (userId, data) => (dispatch) => {
    return putReferential(schema.user, '/api/users/' + userId, data)(dispatch).then(data => {
        dispatch({type: Constants.LANG_UPDATE_ON_USER_CHANGE, payload: data})
    })
}

export const deleteUser = (userId) => (dispatch) => {
    return delReferential('/api/users/' + userId, 'users', userId)(dispatch)
}
