import { Dispatch } from 'redux';
import { simpleCall } from '../utils/Action';
import * as Constants from '../constants/ActionTypes';

const contractImages = () => async (dispatch: Dispatch) => {
  const uri = '/api/contracts/images';
  const ref = simpleCall(uri);
  return ref.then((data) => dispatch({ type: Constants.CONTRACT_IMAGES, payload: data }));
};

export default contractImages;
