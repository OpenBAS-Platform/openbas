import { simpleCall } from '../utils/Action.js';
import * as Constants from '../constants/ActionTypes';
import { Dispatch } from 'redux';

export const contractImages = () => async (dispatch: Dispatch) => {
  const uri = `/api/contracts/images`;
  const ref = simpleCall(uri);
  return ref.then((data) => dispatch({ type: Constants.CONTRACT_IMAGES, payload: data }));
};
