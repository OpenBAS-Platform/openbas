import * as schema from './Schema'
import {getReferential, postReferential} from '../utils/Action'

export const fetchDryruns = (exerciseId) => (dispatch) => {
  var uri = '/api/exercises/' + exerciseId + '/dryruns'
  return getReferential(schema.arrayOfDryruns, uri)(dispatch)
}

export const addDryrun = (exerciseId, data) => (dispatch) => {
  var uri = '/api/exercises/' + exerciseId + '/dryruns'
  return postReferential(schema.dryrun, uri, data)(dispatch)
}