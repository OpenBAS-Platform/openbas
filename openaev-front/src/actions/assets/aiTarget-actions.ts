import { type Dispatch } from 'redux';

import {
  delReferential,
  getReferential,
  postReferential,
  putReferential,
  simpleCall,
  simplePostCall,
  simplePutCall,
} from '../../utils/Action';
import { type AiTargetInput, type Asset, type AssetUpdateMarkingsInput, type SearchPaginationInput } from '../../utils/api-types';
import { aiTarget, arrayOfAiTargets } from './asset-schema';

const AI_TARGET_URI = '/api/ai_targets';

export const addAiTarget = (data: AiTargetInput) => (dispatch: Dispatch) => {
  return postReferential(aiTarget, AI_TARGET_URI, data)(dispatch);
};

// Store-free flavours used by the query-driven pages.
export const createAiTargetCall = (data: AiTargetInput) => {
  return simplePostCall(AI_TARGET_URI, data, undefined, true, true);
};

export const updateAiTargetCall = (assetId: Asset['asset_id'], data: AiTargetInput) => {
  return simplePutCall(`${AI_TARGET_URI}/${assetId}`, data);
};

export const updateAiTargetMarkingsCall = (assetId: string, data: AssetUpdateMarkingsInput, notifySuccess: boolean = true) => {
  return simplePutCall(`/api/assets/${assetId}/markings`, data, undefined, true, notifySuccess);
};

export const updateAiTarget = (
  assetId: Asset['asset_id'],
  data: AiTargetInput,
) => (dispatch: Dispatch) => {
  const uri = `${AI_TARGET_URI}/${assetId}`;
  return putReferential(aiTarget, uri, data)(dispatch);
};

// Replaces the whole set of markings carried by an AI target. Same /api/assets/{id}/markings
// endpoint as the endpoint flow (see updateAssetMarkings in endpoint-actions.ts), but normalized
// through the `aiTarget` schema (bucket "aitargets") rather than `endpoint` (bucket "endpoints") -
// using the wrong one would silently write a phantom entry into the wrong entity bucket.
export const updateAiTargetMarkings = (
  assetId: string,
  data: AssetUpdateMarkingsInput,
  defaultSuccessBehavior: boolean = true,
) => (dispatch: Dispatch) => {
  const uri = `/api/assets/${assetId}/markings`;
  return putReferential(aiTarget, uri, data, defaultSuccessBehavior)(dispatch);
};

export const deleteAiTarget = (assetId: Asset['asset_id']) => (dispatch: Dispatch) => {
  const uri = `${AI_TARGET_URI}/${assetId}`;
  return delReferential(uri, aiTarget.key, assetId)(dispatch);
};

export const fetchAiTargets = () => (dispatch: Dispatch) => {
  return getReferential(arrayOfAiTargets, AI_TARGET_URI)(dispatch);
};

export const searchAiTargets = (searchPaginationInput: SearchPaginationInput) => {
  const data = searchPaginationInput;
  const uri = `${AI_TARGET_URI}/search`;
  return simplePostCall(uri, data);
};

// Single AI target with its full connection config (provider / endpoint / model / token), used to
// prefill the edit form from the unified inventory where the row only carries the shared fields.
export const fetchAiTargetById = (assetId: string) => {
  return simpleCall(`${AI_TARGET_URI}/${assetId}`);
};

export const searchAiTargetAsOption = (searchText: string = '') => {
  const params = { searchText };
  return simpleCall(`${AI_TARGET_URI}/options`, { params });
};

export const searchAiTargetByIdAsOption = (ids: string[]) => {
  return simplePostCall(`${AI_TARGET_URI}/options`, ids);
};
