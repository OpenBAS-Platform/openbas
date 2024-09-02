import * as schema from './Schema';
import { delReferential, postReferential, putReferential, simplePostCall } from '../utils/Action';

export const searchPayloads = (paginationInput) => {
  const data = paginationInput;
  const uri = '/api/payloads/search';
  return simplePostCall(uri, data);
};

export const updatePayload = (payloadId, data) => (dispatch) => {
  const uri = `/api/payloads/${payloadId}`;
  return putReferential(schema.payload, uri, data)(dispatch);
};

export const addPayload = (data) => (dispatch) => {
  const uri = '/api/payloads';
  return postReferential(schema.payload, uri, data)(dispatch);
};

export const duplicatePayload = (payloadId) => (dispatch) => {
  const uri = `/api/payloads/${payloadId}/duplicate`;
  return postReferential(schema.payload, uri, {})(dispatch);
};

export const deletePayload = (payloadId) => (dispatch) => {
  const uri = `/api/payloads/${payloadId}`;
  return delReferential(uri, 'payloads', payloadId)(dispatch);
};
