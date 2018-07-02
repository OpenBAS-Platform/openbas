import * as schema from './Schema'
import {postReferential, delReferential} from '../utils/Action'

export const addGrant = (groupId, data) => (dispatch) => {
  return postReferential(schema.grant, '/api/groups/' + groupId + '/grants', data)(dispatch)
}

export const deleteGrant = (groupId, grantId) => (dispatch) => {
  return delReferential('/api/groups/' + groupId + '/grants/' + grantId, 'grants', groupId)(dispatch)
}