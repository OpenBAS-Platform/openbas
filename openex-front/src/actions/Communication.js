import * as schema from './Schema';
import { getReferential } from '../utils/Action';

export const fetchInjectCommunications = (exerciseId, injectId) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/injects/${injectId}/communications`;
  return getReferential(schema.arrayOfCommunications, uri)(dispatch);
};
