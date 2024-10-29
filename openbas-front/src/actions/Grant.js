import { delReferential, postReferential } from '../utils/Action';
import * as schema from './Schema';

export const addGrant = (groupId, data) => (dispatch) => {
  const uri = `/api/groups/${groupId}/grants`;
  return postReferential(schema.grant, uri, data)(dispatch);
};

export const addGroupOrganization = (groupId, data) => (dispatch) => {
  const uri = `/api/groups/${groupId}/organizations`;
  return postReferential(schema.group, uri, data)(dispatch);
};

export const deleteGroupOrganization = (groupId, organizationId) => (dispatch) => {
  return delReferential(
    `/api/groups/${groupId}/organizations/${organizationId}`,
    'grants',
    organizationId,
  )(dispatch);
};

export const deleteGrant = (groupId, grantId) => (dispatch) => {
  return delReferential(`/api/grants/${grantId}`, 'grants', groupId)(dispatch);
};
