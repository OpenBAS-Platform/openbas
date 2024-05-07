import { Dispatch } from 'redux';
import { getReferential, simpleCall, simpleDelCall, simplePostCall, simplePutCall } from '../../utils/Action';
import type { AtomicTestingInput, SearchPaginationInput } from '../../utils/api-types';
import { inject } from '../Schema';

const ATOMIC_TESTING_URI = '/api/atomic_testings';

export const searchAtomicTestings = (searchPaginationInput: SearchPaginationInput) => {
  const data = searchPaginationInput;
  const uri = `${ATOMIC_TESTING_URI}/search`;
  return simplePostCall(uri, data);
};

export const fetchInjectResultDto = (injectId: string) => {
  const uri = `${ATOMIC_TESTING_URI}/${injectId}`;
  return simpleCall(uri);
};

// FIXME: find a better way to retrieve inject for update
export const fetchAtomicTestingForUpdate = (injectId: string) => (dispatch: Dispatch) => {
  const uri = `${ATOMIC_TESTING_URI}/${injectId}/update`;
  return getReferential(inject, uri)(dispatch);
};

export const deleteAtomicTesting = (injectId: string) => {
  const uri = `${ATOMIC_TESTING_URI}/${injectId}`;
  return simpleDelCall(uri, injectId);
};

export const updateAtomicTesting = (injectId: string, data: AtomicTestingInput) => {
  const uri = `${ATOMIC_TESTING_URI}/${injectId}`;
  return simplePutCall(uri, data);
};

export const tryAtomicTesting = (injectId: string) => {
  const uri = `${ATOMIC_TESTING_URI}/try/${injectId}`;
  return simpleCall(uri);
};

export const fetchTargetResult = (injectId: string, targetId: string, targetType: string) => {
  const uri = `${ATOMIC_TESTING_URI}/${injectId}/target_results/${targetId}/types/${targetType}`;
  return simpleCall(uri);
};

export const createAtomicTesting = (data: AtomicTestingInput) => {
  return simplePostCall(ATOMIC_TESTING_URI, data);
};
