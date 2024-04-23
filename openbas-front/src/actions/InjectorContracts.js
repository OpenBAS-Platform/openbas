import * as schema from './Schema';
import { getReferential, putReferential, postReferential, delReferential, simplePostCall, buildUri } from '../utils/Action';
import * as Constants from '../constants/ActionTypes';
import { api } from '../network';

export const fetchInjectorContracts = () => async (dispatch) => {
  const uri = '/api/injector_contracts';
  try {
    const response = await api(schema.arrayOfInjectorContracts)
      .get(buildUri(uri));
    response.data.result.forEach((id) => {
      const parsedContent = JSON.parse(response.data.entities.injector_contracts[id].injector_contract_content);
      response.data.entities.injector_contracts[id] = {
        ...response.data.entities.injector_contracts[id],
        ...parsedContent,
      };
    });
    dispatch({
      type: Constants.DATA_FETCH_SUCCESS,
      payload: response.data,
    });
    return response.data;
  } catch (error) {
    dispatch({ type: Constants.DATA_FETCH_ERROR, payload: error });
    throw error;
  }
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
