import * as schema from './Schema'
import {getReferential} from '../utils/Action'

export const fetchDryinjects = (exerciseId, dryrunId, noloading) => (dispatch) => {
  var uri = '/api/exercises/' + exerciseId + '/dryruns/' + dryrunId + '/dryinjects'
  return getReferential(schema.arrayOfDryinjects, uri, noloading)(dispatch)
}