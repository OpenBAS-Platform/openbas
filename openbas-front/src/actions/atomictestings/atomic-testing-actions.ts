import { Dispatch } from 'redux';
import { arrayOfAtomicTestings, arrayOftargetResults, atomicTesting, atomicTestingDetail } from './atomic-testing-schema';
import { delReferential, getReferential, postReferential, putReferential } from '../../utils/Action';
import type { AtomicTestingInput } from '../../utils/api-types';

const ATOMIC_TESTING_URI = '/api/atomic_testings';

export const fetchAtomicTestings = () => (dispatch: Dispatch) => {
  return getReferential(arrayOfAtomicTestings, ATOMIC_TESTING_URI)(dispatch);
};

export const fetchAtomicTesting = (injectId: string) => (dispatch: Dispatch) => {
  const uri = `${ATOMIC_TESTING_URI}/${injectId}`;
  return getReferential(atomicTesting, uri)(dispatch);
};

export const fetchAtomicTestingDetail = (injectId: string) => (dispatch: Dispatch) => {
  const uri = `${ATOMIC_TESTING_URI}/${injectId}/detail`;
  return getReferential(atomicTestingDetail, uri)(dispatch);
};

export const deleteAtomicTesting = (injectId: string) => (dispatch: Dispatch) => {
  const uri = `${ATOMIC_TESTING_URI}/${injectId}`;
  return delReferential(uri, atomicTesting.key, injectId)(dispatch);
};

export const updateAtomicTesting = (injectId: string, data: string) => (dispatch: Dispatch) => {
  const uri = `${ATOMIC_TESTING_URI}/${injectId}`;
  return putReferential(atomicTesting.key, uri, data)(dispatch);
};

export const tryAtomicTesting = (injectId: string) => (dispatch: Dispatch) => {
  const uri = `${ATOMIC_TESTING_URI}/try/${injectId}`;
  return getReferential(null, uri, null)(dispatch);
};

export const fetchTargetResult = (injectId: string, targetId: string, targetType: string) => (dispatch: Dispatch) => {
  const uri = `${ATOMIC_TESTING_URI}/${injectId}/target_results/${targetId}/types/${targetType}`;
  return getReferential(arrayOftargetResults, uri)(dispatch);
};

export const createAtomicTesting = (data: AtomicTestingInput) => (dispatch: Dispatch) => {
  return postReferential(atomicTesting, ATOMIC_TESTING_URI, data)(dispatch);
};
