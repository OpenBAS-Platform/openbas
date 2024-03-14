import * as schema from './Schema';
import { getReferential, putReferential, postReferential, delReferential, simplePostCall } from '../utils/Action';

export const fetchKillChainPhases = () => (dispatch) => {
  const uri = '/api/kill_chain_phases';
  return getReferential(schema.arrayOfKillChainPhases, uri)(dispatch);
};

export const searchKillChainPhases = (contractSearchInput, page, size) => {
  const data = contractSearchInput;
  const uri = `/api/kill_chain_phases/search?page=${page}&size=${size}`;
  return simplePostCall(uri, data);
};

export const updateKillChainPhase = (killChainPhaseId, data) => (dispatch) => {
  const uri = `/api/kill_chain_phases/${killChainPhaseId}`;
  return putReferential(schema.killChainPhase, uri, data)(dispatch);
};

export const addKillChainPhase = (data) => (dispatch) => {
  const uri = '/api/kill_chain_phases';
  return postReferential(schema.killChainPhase, uri, data)(dispatch);
};

export const deleteKillChainPhase = (killChainPhaseId) => (dispatch) => {
  const uri = `/api/kill_chain_phases/${killChainPhaseId}`;
  return delReferential(uri, 'killchainphases', killChainPhaseId)(dispatch);
};
