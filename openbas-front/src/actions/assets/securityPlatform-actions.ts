import { type Dispatch } from 'redux';

import { delReferential, getReferential, postReferential, putReferential, simplePostCall } from '../../utils/Action';
import { type SearchPaginationInput, type SecurityPlatform, type SecurityPlatformInput } from '../../utils/api-types';
import { arrayOfSecurityPlatforms, securityPlatform } from './asset-schema';

const SECURITY_PLATFORM_URI = '/api/security_platforms';

export const addSecurityPlatform = (data: SecurityPlatformInput) => (dispatch: Dispatch) => {
  return postReferential(securityPlatform, SECURITY_PLATFORM_URI, data)(dispatch);
};

export const updateSecurityPlatform = (
  assetId: SecurityPlatform['asset_id'],
  data: SecurityPlatformInput,
) => (dispatch: Dispatch) => {
  const uri = `${SECURITY_PLATFORM_URI}/${assetId}`;
  return putReferential(securityPlatform, uri, data)(dispatch);
};

export const deleteSecurityPlatform = (assetId: SecurityPlatform['asset_id']) => (dispatch: Dispatch) => {
  const uri = `${SECURITY_PLATFORM_URI}/${assetId}`;
  return delReferential(uri, securityPlatform.key, assetId)(dispatch);
};

export const fetchSecurityPlatforms = () => (dispatch: Dispatch) => {
  return getReferential(arrayOfSecurityPlatforms, SECURITY_PLATFORM_URI)(dispatch);
};

export const searchSecurityPlatforms = (searchPaginationInput: SearchPaginationInput) => {
  const data = searchPaginationInput;
  const uri = `${SECURITY_PLATFORM_URI}/search`;
  return simplePostCall(uri, data);
};
