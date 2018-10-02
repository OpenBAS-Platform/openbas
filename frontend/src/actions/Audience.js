import * as schema from './Schema'
import {getReferential, fileSave, putReferential, postReferential, delReferential} from '../utils/Action'

export const fetchAudiences = (exerciseId) => (dispatch) => {
    let uri = '/api/exercises/' + exerciseId + '/audiences'
    return getReferential(schema.arrayOfAudiences, uri)(dispatch)
}

export const downloadExportAudiences = (exerciseId) => (dispatch) => {
    return fileSave('/api/exercises/' + exerciseId + '/audiences.xlsx', 'audiences.xlsx')(dispatch)
}

export const downloadExportAudience = (exerciseId, audienceId) => (dispatch) => {
    return fileSave('/api/exercises/' + exerciseId + '/audiences/' + audienceId + '/users.xlsx', 'users.xlsx')(dispatch)
}

export const updateAudience = (exerciseId, audienceId, data) => (dispatch) => {
    let uri = '/api/exercises/' + exerciseId + '/audiences/' + audienceId
    return putReferential(schema.audience, uri, data)(dispatch)
}

export const addAudience = (exerciseId, data) => (dispatch) => {
    let uri = '/api/exercises/' + exerciseId + '/audiences'
    return postReferential(schema.audience, uri, data)(dispatch)
}

export const deleteAudience = (exerciseId, audienceId) => (dispatch) => {
    let uri = '/api/exercises/' + exerciseId + '/audiences/' + audienceId
    return delReferential(uri, 'audiences', audienceId)(dispatch)
}