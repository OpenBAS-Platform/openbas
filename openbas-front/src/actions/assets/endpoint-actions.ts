import { Dispatch } from 'redux';

import { delReferential, getReferential, postReferential, putReferential, simplePostCall } from '../../utils/Action';
import type { Endpoint, EndpointInput, SearchPaginationInput } from '../../utils/api-types';
import { arrayOfEndpoints, endpoint } from './asset-schema';

const ENDPOINT_URI = '/api/endpoints';

export const addEndpoint = (data: EndpointInput) => (dispatch: Dispatch) => {
  return postReferential(endpoint, ENDPOINT_URI, data)(dispatch);
};

export const updateEndpoint = (
  assetId: Endpoint['asset_id'],
  data: EndpointInput,
) => (dispatch: Dispatch) => {
  const uri = `${ENDPOINT_URI}/${assetId}`;
  return putReferential(endpoint, uri, data)(dispatch);
};

export const deleteEndpoint = (assetId: Endpoint['asset_id']) => (dispatch: Dispatch) => {
  const uri = `${ENDPOINT_URI}/${assetId}`;
  return delReferential(uri, endpoint.key, assetId)(dispatch);
};

export const fetchEndpoints = () => (dispatch: Dispatch) => {
  return getReferential(arrayOfEndpoints, ENDPOINT_URI)(dispatch);
};

export const searchEndpoints = (searchPaginationInput: SearchPaginationInput) => {
  const data = searchPaginationInput;
  const uri = '/api/endpoints/search';
  return simplePostCall(uri, data);
};
