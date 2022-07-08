import * as schema from './Schema';
import { getReferential } from '../utils/Action';

export const fetchCommunications = (exerciseId) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/communications`;
  return getReferential(schema.arrayOfCommunications, uri)(dispatch);
};
