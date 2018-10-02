import * as schema from './Schema'
import {getReferential, postReferential, delReferential} from '../utils/Action'

export const fetchDryruns = (exerciseId, noloading) => (dispatch) => {
    let uri = '/api/exercises/' + exerciseId + '/dryruns'
    return getReferential(schema.arrayOfDryruns, uri, noloading)(dispatch)
}

export const fetchDryrun = (exerciseId, dryrunId, noloading) => (dispatch) => {
    let uri = '/api/exercises/' + exerciseId + '/dryruns/' + dryrunId
    return getReferential(schema.dryrun, uri, noloading)(dispatch)
}

export const addDryrun = (exerciseId, data) => (dispatch) => {
    let uri = '/api/exercises/' + exerciseId + '/dryruns'
    return postReferential(schema.dryrun, uri, data)(dispatch)
}

export const deleteDryrun = (exerciseId, dryrunId) => (dispatch) => {
    let uri = '/api/exercises/' + exerciseId + '/dryruns/' + dryrunId
    return delReferential(uri, 'dryruns', dryrunId)(dispatch)
}