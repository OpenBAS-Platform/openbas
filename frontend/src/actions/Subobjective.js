import * as schema from './Schema'
import {getReferential, putReferential, postReferential, delReferential} from '../utils/Action'

export const fetchSubobjectives = (exerciseId) => (dispatch) => {
  var uri = '/api/exercises/' + exerciseId + '/subobjectives'
  return getReferential(schema.arrayOfSubobjectives, uri)(dispatch)
}

export const updateSubobjective = (exerciseId, objectiveId, subobjectiveId, data) => (dispatch) => {
  var uri = '/api/exercises/' + exerciseId + '/objectives/' + objectiveId + '/subobjectives/' + subobjectiveId
  return putReferential(schema.subobjective, uri, data)(dispatch)
}

export const addSubobjective = (exerciseId, objectiveId, data) => (dispatch) => {
  var uri = '/api/exercises/' + exerciseId + '/objectives/' + objectiveId + '/subobjectives'
  return postReferential(schema.subobjective, uri, data)(dispatch)
}

export const deleteSubobjective = (exerciseId, objectiveId, subobjectiveId) => (dispatch) => {
  var uri = '/api/exercises/' + exerciseId + '/objectives/' + objectiveId + '/subobjectives/' + subobjectiveId
  return delReferential(uri, 'subobjectives', subobjectiveId)(dispatch)
}