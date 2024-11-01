import { delReferential, getReferential, postReferential, putReferential, simplePostCall } from '../utils/Action';
import * as schema from './Schema';

export const fetchInjectors = () => (dispatch) => {
  const uri = '/api/injectors';
  return getReferential(schema.arrayOfInjectors, uri)(dispatch);
};

export const fetchInjector = injectorId => (dispatch) => {
  const uri = `/api/injectors/${injectorId}`;
  return getReferential(schema.injector, uri)(dispatch);
};

export const searchInjectors = (paginationInput) => {
  const data = paginationInput;
  const uri = '/api/injectors/search';
  return simplePostCall(uri, data);
};

export const updateInjector = (injectorId, data) => (dispatch) => {
  const uri = `/api/injectors/${injectorId}`;
  return putReferential(schema.injector, uri, data)(dispatch);
};

export const addInjector = data => (dispatch) => {
  const uri = '/api/injectors';
  return postReferential(schema.injector, uri, data)(dispatch);
};

export const deleteInjector = injectorId => (dispatch) => {
  const uri = `/api/injectors/${injectorId}`;
  return delReferential(uri, 'injectors', injectorId)(dispatch);
};
