import { delReferential, getReferential, postReferential, putReferential, simplePostCall } from '../utils/Action';
import * as schema from './Schema';

export const fetchMitigations = () => (dispatch) => {
  const uri = '/api/mitigations';
  return getReferential(schema.arrayOfMitigations, uri)(dispatch);
};

export const searchMitigations = (paginationInput) => {
  const data = paginationInput;
  const uri = '/api/mitigations/search';
  return simplePostCall(uri, data);
};

export const updateMitigation = (mitigationId, data) => (dispatch) => {
  const uri = `/api/mitigations/${mitigationId}`;
  return putReferential(schema.mitigation, uri, data)(dispatch);
};

export const addMitigation = data => (dispatch) => {
  const uri = '/api/mitigations';
  return postReferential(schema.mitigation, uri, data)(dispatch);
};

export const deleteMitigation = mitigationId => (dispatch) => {
  const uri = `/api/mitigations/${mitigationId}`;
  return delReferential(uri, 'mitigations', mitigationId)(dispatch);
};
