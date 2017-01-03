import * as schema from './Schema'
import {getReferential, putReferential} from '../utils/Action'

export const fetchOutcomes = (exerciseId) => (dispatch) => {
  var uri = '/api/exercises/' + exerciseId + '/outcomes'
  return getReferential(schema.arrayOfOutcomes, uri)(dispatch)
}

export const updateOutcome = (exerciseId, eventId, incidentId, outcomeId, data) => (dispatch) => {
  var uri = '/api/exercises/' + exerciseId + '/events/' + eventId + '/incidents/' + incidentId + '/outcome/' + outcomeId
  return putReferential(schema.outcome, uri, data)(dispatch)
}