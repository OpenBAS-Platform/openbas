import * as Constants from '../constants/ActionTypes';
import {api} from '../App';
import * as schema from './Schema'

export const fetchFiles = () => (dispatch) => {
  dispatch({type: Constants.APPLICATION_FETCH_FILES_SUBMITTED});
  return api(schema.arrayOfFiles).get('/api/files').then(function (response) {
    dispatch({
      type: Constants.APPLICATION_FETCH_FILES_SUCCESS,
      payload: response.data
    })
  }).catch(function (response) {
    dispatch({
      type: Constants.APPLICATION_FETCH_FILES_ERROR,
      payload: response.data
    })
  })
}

export const addFile = (data) => (dispatch) => {
  dispatch({type: Constants.APPLICATION_ADD_FILE_SUBMITTED});
  return api(schema.file).post('/api/files', data).then(function (response) {
    dispatch({
      type: Constants.APPLICATION_ADD_FILE_SUCCESS,
      payload: response.data
    })
  }).catch(function (response) {
    dispatch({
      type: Constants.APPLICATION_ADD_FILE_ERROR,
      payload: response.data
    })
  })
}