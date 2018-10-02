import * as schema from './Schema'
import {putReferential} from '../utils/Action'

export const updateOutcome = (exerciseId, eventId, incidentId, outcomeId, data) => (dispatch) => {
    let uri = '/api/exercises/' + exerciseId + '/events/' + eventId + '/incidents/' + incidentId + '/outcome/' + outcomeId
    return putReferential(schema.incident, uri, data)(dispatch)
}