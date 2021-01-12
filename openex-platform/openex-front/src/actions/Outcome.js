import * as schema from './Schema';
import { putReferential } from '../utils/Action';

// eslint-disable-next-line import/prefer-default-export
export const updateOutcome = (
  exerciseId,
  eventId,
  incidentId,
  outcomeId,
  data,
) => (dispatch) => {
  const uri = `/api/exercises/${
    exerciseId
  }/events/${
    eventId
  }/incidents/${
    incidentId
  }/outcome/${
    outcomeId}`;
  return putReferential(schema.incident, uri, data)(dispatch);
};
