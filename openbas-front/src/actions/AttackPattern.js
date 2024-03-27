import * as schema from './Schema';
import { getReferential, putReferential, postReferential, delReferential, simplePostCall } from '../utils/Action';

export const fetchAttackPatterns = () => (dispatch) => {
  const uri = '/api/attack_patterns';
  return getReferential(schema.arrayOfAttackPatterns, uri)(dispatch);
};

export const searchAttackPatterns = (paginationInput) => {
  const data = paginationInput;
  const uri = '/api/attack_patterns/search';
  return simplePostCall(uri, data);
};

export const updateAttackPattern = (attackPatternId, data) => (dispatch) => {
  const uri = `/api/attack_patterns/${attackPatternId}`;
  return putReferential(schema.attackPattern, uri, data)(dispatch);
};

export const addAttackPattern = (data) => (dispatch) => {
  const uri = '/api/attack_patterns';
  return postReferential(schema.attackPattern, uri, data)(dispatch);
};

export const deleteAttackPattern = (attackPatternId) => (dispatch) => {
  const uri = `/api/attack_patterns/${attackPatternId}`;
  return delReferential(uri, 'attackPatterns', attackPatternId)(dispatch);
};
