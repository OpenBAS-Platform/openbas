import * as schema from './Schema';
// eslint-disable-next-line import/no-cycle
import { postReferential, delReferential } from '../utils/Action';

export const addGrant = (groupId, data) => (dispatch) => postReferential(
  schema.grant,
  `/api/groups/${groupId}/grants`,
  data,
)(dispatch);

export const deleteGrant = (groupId, grantId) => (dispatch) => delReferential(
  `/api/groups/${groupId}/grants/${grantId}`,
  'grants',
  groupId,
)(dispatch);
