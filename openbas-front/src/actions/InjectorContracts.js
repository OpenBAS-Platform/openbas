import * as schema from './Schema';
import { getReferential, putReferential, postReferential, delReferential, simplePostCall } from '../utils/Action';

export const fetchInjectorContracts = () => (dispatch) => {
  const uri = '/api/injector_contracts';
  return getReferential(schema.arrayOfInjectorContracts, uri)(dispatch);
};

export const fetchInjectorContract = (injectorContractId) => (dispatch) => {
  const uri = `/api/injector_contracts/${injectorContractId}`;
  return getReferential(schema.injectorContract, uri)(dispatch);
};

export const searchInjectorContracts = (paginationInput) => {
  const data = paginationInput;
  const uri = '/api/injector_contracts/search';
  return simplePostCall(uri, data);
};

export const updateInjectorContract = (injectorContractId, data) => (dispatch) => {
  const uri = `/api/injector_contracts/${injectorContractId}`;
  return putReferential(schema.injectorContract, uri, data)(dispatch);
};

export const addInjectorContract = (data) => (dispatch) => {
  const uri = '/api/injector_contracts';
  return postReferential(schema.injectorContract, uri, data)(dispatch);
};

export const deleteInjectorContract = (injectorContractId) => (dispatch) => {
  const uri = `/api/injector_contracts/${injectorContractId}`;
  return delReferential(uri, 'injectorcontracts', injectorContractId)(dispatch);
};
