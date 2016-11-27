import * as Constants from '../constants/ActionTypes'
import {SubmissionError} from 'redux-form'
import {api} from '../App'
import Immutable from 'seamless-immutable'

export const getReferential = (schema, uri) => (dispatch) => {
  dispatch({type: Constants.DATA_FETCH_SUBMITTED});
  return api(schema).get(uri).then(function (response) {
    dispatch({type: Constants.DATA_FETCH_SUCCESS, payload: response.data})
  }).catch(function () {
    dispatch({type: Constants.DATA_FETCH_ERROR});
    throw new SubmissionError({_error: 'Failed to fetch from ' + uri})
  })
}

export const putReferential = (schema, uri, data) => (dispatch) => {
  dispatch({type: Constants.DATA_FETCH_SUBMITTED});
  return api(schema).put(uri, data).then(function (response) {
    var payload = Immutable(response.data.toJS())
    dispatch({type: Constants.DATA_FETCH_SUCCESS, payload: response.data})
    return payload
  }).catch(function () {
    dispatch({type: Constants.DATA_FETCH_ERROR});
    throw new SubmissionError({_error: 'Failed to update from ' + uri})
  })
}

export const postReferential = (schema, uri, data) => (dispatch) => {
  dispatch({type: Constants.DATA_FETCH_SUBMITTED});
  return api(schema).post(uri, data).then(function (response) {
    var payload = Immutable(response.data.toJS())
    dispatch({type: Constants.DATA_FETCH_SUCCESS, payload: response.data})
    return payload
  }).catch(function () {
    dispatch({type: Constants.DATA_FETCH_ERROR});
    throw new SubmissionError({_error: 'Failed to add from ' + uri})
  })
}

export const delReferential = (uri, type, id) => (dispatch) => {
  dispatch({type: Constants.DATA_FETCH_SUBMITTED});
  return api().delete(uri).then(function () {
    dispatch({type: Constants.DATA_DELETE_SUCCESS, payload: Immutable({type, id})})
  }).catch(function () {
    dispatch({type: Constants.DATA_FETCH_ERROR});
    throw new SubmissionError({_error: 'Failed to remove from ' + uri})
  })
}