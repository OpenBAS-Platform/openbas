import { Dispatch } from 'redux';
import { atomicTesting, atomicTestingDetail } from './atomic-testing-schema';
import { delReferential, getReferential, postReferential, putReferential, simpleCall, simplePostCall } from '../../utils/Action';
import type { AtomicTestingInput, AtomicTestingUpdateTagsInput, SearchPaginationInput } from '../../utils/api-types';
import { inject } from '../Schema';

const ATOMIC_TESTING_URI = '/api/atomic_testings';

export const searchAtomicTestings = (searchPaginationInput: SearchPaginationInput) => {
  const data = searchPaginationInput;
  const uri = `${ATOMIC_TESTING_URI}/search`;
  return simplePostCall(uri, data);
};

export const fetchAtomicTesting = (injectId: string) => (dispatch: Dispatch) => {
  const uri = `${ATOMIC_TESTING_URI}/${injectId}`;
  return getReferential(atomicTesting, uri)(dispatch);
};
export const fetchInjectResultDto = (injectId: string) => {
  const uri = `${ATOMIC_TESTING_URI}/${injectId}`;
  return simpleCall(uri);
};

export const fetchAtomicTestingDetail = (injectId: string) => (dispatch: Dispatch) => {
  const uri = `${ATOMIC_TESTING_URI}/${injectId}/detail`;
  return getReferential(atomicTestingDetail, uri)(dispatch);
};

// FIXME: find a better way to retrieve inject for update
export const fetchAtomicTestingForUpdate = (injectId: string) => (dispatch: Dispatch) => {
  const uri = `${ATOMIC_TESTING_URI}/${injectId}/update`;
  return getReferential(inject, uri)(dispatch);
};

export const deleteAtomicTesting = (injectId: string) => (dispatch: Dispatch) => {
  const uri = `${ATOMIC_TESTING_URI}/${injectId}`;
  return delReferential(uri, atomicTesting.key, injectId)(dispatch);
};

export const updateAtomicTesting = (injectId: string, data: AtomicTestingInput) => (dispatch: Dispatch) => {
  const uri = `${ATOMIC_TESTING_URI}/${injectId}`;
  return putReferential(atomicTesting.key, uri, data)(dispatch);
};

export const tryAtomicTesting = (injectId: string) => (dispatch: Dispatch) => {
  const uri = `${ATOMIC_TESTING_URI}/try/${injectId}`;
  return getReferential(null, uri, null)(dispatch);
};

export const fetchTargetResult = (injectId: string, targetId: string, targetType: string) => {
  const uri = `${ATOMIC_TESTING_URI}/${injectId}/target_results/${targetId}/types/${targetType}`;
  return simpleCall(uri);
};

export const createAtomicTesting = (data: AtomicTestingInput) => (dispatch: Dispatch) => {
  return postReferential(atomicTesting, ATOMIC_TESTING_URI, data)(dispatch);
};

export const updateAtomicTestingTags = (injectId: string, data: AtomicTestingUpdateTagsInput) => (dispatch: Dispatch) => {
  const uri = `${ATOMIC_TESTING_URI}/${injectId}/tags`;
  return putReferential(atomicTesting, uri, data)(dispatch);
};
