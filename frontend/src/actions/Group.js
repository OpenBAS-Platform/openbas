import * as schema from './Schema'
import {getReferential, postReferential, putReferential, delReferential} from '../utils/Action'

export const fetchGroups = () => (dispatch) => {
    return getReferential(schema.arrayOfGroups, '/api/groups')(dispatch)
}

export const fetchGroup = (groupId) => (dispatch) => {
    return getReferential(schema.group, '/api/groups/' + groupId)(dispatch)
}

export const addGroup = (data) => (dispatch) => {
    return postReferential(schema.group, '/api/groups', data)(dispatch)
}

export const updateGroup = (userId, data) => (dispatch) => {
    return putReferential(schema.group, '/api/groups/' + userId, data)(dispatch)
}

export const deleteGroup = (groupId) => (dispatch) => {
    return delReferential('/api/groups/' + groupId, 'groups', groupId)(dispatch)
}