import * as schema from './Schema';
import {
  getReferential,
  postReferential,
  putReferential,
  delReferential,
} from '../utils/Action';

export const fetchGroups = () => (dispatch) => getReferential(schema.arrayOfGroups, '/api/groups')(dispatch);

export const fetchGroup = (groupId) => (dispatch) => getReferential(schema.group, `/api/groups/${groupId}`)(dispatch);

export const addGroup = (data) => (dispatch) => postReferential(schema.group, '/api/groups', data)(dispatch);

export const updateGroupInformation = (groupId, data) => (dispatch) => putReferential(schema.group, `/api/groups/${groupId}/information`, data)(dispatch);

export const updateGroupUsers = (groupId, data) => (dispatch) => putReferential(schema.group, `/api/groups/${groupId}/users`, data)(dispatch);

export const deleteGroup = (groupId) => (dispatch) => delReferential(`/api/groups/${groupId}`, 'groups', groupId)(dispatch);
