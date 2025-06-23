import type { Dispatch } from 'redux';

import { delReferential, postReferential, putReferential, simpleCall, simplePostCall } from '../../utils/Action';
import {
  type InjectExportRequestInput, type InjectImportInput,
  type Payload,
  type PayloadCreateInput, type PayloadExportRequestInput,
  type PayloadUpdateInput,
  type SearchPaginationInput,
} from '../../utils/api-types';
import { MESSAGING$ } from '../../utils/Environment';
import { payload } from '../Schema';

export const searchPayloads = (paginationInput: SearchPaginationInput) => {
  const data = paginationInput;
  const uri = '/api/payloads/search';
  return simplePostCall(uri, data);
};

export const fetchPayload = (payloadId: string) => {
  const uri = `/api/payloads/${payloadId}`;
  return simpleCall(uri);
};

export const updatePayload = (payloadId: Payload['payload_id'], data: PayloadUpdateInput) => (dispatch: Dispatch) => {
  const uri = `/api/payloads/${payloadId}`;
  return putReferential(payload, uri, data)(dispatch);
};

export const addPayload = (data: PayloadCreateInput) => (dispatch: Dispatch) => {
  const uri = '/api/payloads';
  return postReferential(payload, uri, data)(dispatch);
};

export const exportPayloads = (data: PayloadExportRequestInput) => {
  const uri = '/api/payloads/export';
  return simplePostCall(uri, data, { responseType: 'arraybuffer' }).catch((error) => {
    MESSAGING$.notifyError('Could not request export of payloads');
    throw error;
  });
};

export const importPayloads = (file: File) => {
  const uri = '/api/payloads/import';
  const formData = new FormData();
  formData.append('file', file);
  return simplePostCall(uri, formData).catch((error) => {
    MESSAGING$.notifyError('Could not import payloads');
    throw error;
  });
};

export const duplicatePayload = (payloadId: Payload['payload_id']) => (dispatch: Dispatch) => {
  const uri = `/api/payloads/${payloadId}/duplicate`;
  return postReferential(payload, uri, {})(dispatch);
};

export const deletePayload = (payloadId: Payload['payload_id']) => (dispatch: Dispatch) => {
  const uri = `/api/payloads/${payloadId}`;
  return delReferential(uri, 'payloads', payloadId)(dispatch);
};
