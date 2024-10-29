import { getReferential, postReferential } from '../utils/Action';
import * as schema from './Schema';

export const fetchDryinjects = (exerciseId, dryrunId) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/dryruns/${dryrunId}/dryinjects`;
  return getReferential(schema.arrayOfDryinjects, uri)(dispatch);
};

export const dryinjectDone = dryinjectId => (dispatch) => {
  const data = { status: 'SUCCESS', message: '[\'Manual validation\']' };
  const uri = `/api/dryinjects/${dryinjectId}/status`;
  return postReferential(null, uri, data)(dispatch);
};
