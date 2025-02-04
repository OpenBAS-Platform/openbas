import { Dispatch } from 'redux';

import { delReferential, postReferential, putReferential, simplePostCall } from '../../utils/Action.js';
import { Payload, PayloadCreateInput, PayloadUpdateInput, SearchPaginationInput } from '../../utils/api-types';
import * as schema from '../Schema.js';

const PAYLOAD_URI = '/api/payloads';

export const searchPayloads = (paginationInput: SearchPaginationInput) => {
  const data = paginationInput;
  const uri = PAYLOAD_URI + '/search';
  return simplePostCall(uri, data);
};

export const fetchPayload = (payloadExternalId: Payload['payload_external_id'], payloadVersion: Payload['payload_version']) => {
  const data = {
    payload_external_id: payloadExternalId,
    payload_version: payloadVersion,
  };
  return simplePostCall(`${PAYLOAD_URI}/find`, data);
};

export const updatePayload = (payloadId: Payload['payload_id'], data: PayloadUpdateInput) => (dispatch: Dispatch) => {
  const uri = `${PAYLOAD_URI}/${payloadId}`;
  return putReferential(schema.payload, uri, data)(dispatch);
};

export const addPayload = (data: PayloadCreateInput) => (dispatch: Dispatch) => {
  return postReferential(schema.payload, PAYLOAD_URI, data)(dispatch);
};

export const duplicatePayload = (payloadId: Payload['payload_id']) => (dispatch: Dispatch) => {
  const uri = `${PAYLOAD_URI}/${payloadId}/duplicate`;
  return postReferential(schema.payload, uri, {})(dispatch);
};

export const deletePayload = (payloadId: Payload['payload_id']) => (dispatch: Dispatch) => {
  const uri = `${PAYLOAD_URI}/${payloadId}`;
  return delReferential(uri, 'payloads', payloadId)(dispatch);
};
