import { Dispatch } from 'redux';
import { arrayOfAtomicTestings, atomicTesting } from './atomic-testing-schema';
import { delReferential, getReferential, putReferential } from '../../utils/Action';

const ATOMIC_TESTING_URI = '/api/atomic_testings';

export const fetchAtomicTestings = () => (dispatch: Dispatch) => {
  return getReferential(arrayOfAtomicTestings, ATOMIC_TESTING_URI)(dispatch);
};

export const fetchAtomicTesting = (injectId: string) => (dispatch: Dispatch) => {
  const uri = `${ATOMIC_TESTING_URI}/${injectId}`;
  return getReferential(atomicTesting, uri)(dispatch);
};

export const deleteAtomicTesting = (injectId: string) => (dispatch: Dispatch) => {
  const uri = `${ATOMIC_TESTING_URI}/${injectId}`;
  return delReferential(uri, atomicTesting.key, injectId)(dispatch);
};

export const updateAtomicTesting = (injectId: string, data: string) => (dispatch: Dispatch) => {
  const uri = `${ATOMIC_TESTING_URI}/${injectId}`;
  return putReferential(atomicTesting.key, uri, data)(dispatch);
};
