import * as Constants from '../constants/ActionTypes'
import {SubmissionError} from 'redux-form'
import Immutable from 'seamless-immutable'
import {api} from '../App'
import * as R from 'ramda'
import FileSaver from 'file-saver'

const submitErrors = (data) => {
  const errorsExtractor = R.pipe(
    R.pathOr({}, ['errors', 'children']),
    R.toPairs(),
    R.map(elem => {
      const extractErrorsPipe = R.pipe(
        R.tail(),
        R.head(),
        R.propOr([], 'errors'),
        R.head()
      )
      return [R.head(elem), extractErrorsPipe(elem)]
    }),
    R.fromPairs(),
    R.set(R.lensProp('_error'), data.message)
  )
  return new SubmissionError(errorsExtractor(data))
}

export const fileSave = (uri, filename) => () => {
  return api().get(uri, {responseType: 'blob'}).then(function (response) {
    FileSaver.saveAs(response.data, filename)
  })
}

export const fileDownload = (uri) => () => {
  return api().get(uri, {responseType: 'blob'})
}

export const getReferential = (schema, uri, noloading) => (dispatch) => {
  if (noloading !== true) {
    dispatch({type: Constants.DATA_FETCH_SUBMITTED})
  }
  return api(schema).get(uri).then(function (response) {
    dispatch({type: Constants.DATA_FETCH_SUCCESS, payload: response.data})
    return response.data
  })
}

export const putReferential = (schema, uri, data) => (dispatch) => {
  dispatch({type: Constants.DATA_FETCH_SUBMITTED})
  return api(schema).put(uri, data).then(function (response) {
    dispatch({type: Constants.DATA_FETCH_SUCCESS, payload: response.data})
    dispatch({type: Constants.DATA_UPDATE_SUCCESS, payload: response.data})
    return response.data
  }).catch(function (data) {
    dispatch({type: Constants.DATA_FETCH_ERROR})
    throw submitErrors(data)
  })
}

export const postReferential = (schema, uri, data) => (dispatch) => {
  dispatch({type: Constants.DATA_FETCH_SUBMITTED})
  return api(schema).post(uri, data).then(function (response) {
    dispatch({type: Constants.DATA_FETCH_SUCCESS, payload: response.data})
    dispatch({type: Constants.DATA_UPDATE_SUCCESS, payload: response.data})
    return response.data
  }).catch(function (data) {
    dispatch({type: Constants.DATA_FETCH_ERROR})
    throw submitErrors(data)
  })
}

export const delReferential = (uri, type, id) => (dispatch) => {
  dispatch({type: Constants.DATA_FETCH_SUBMITTED})
  return api().delete(uri).then(function () {
    dispatch({type: Constants.DATA_DELETE_SUCCESS, payload: Immutable({type, id})})
  }).catch(function (data) {
    dispatch({type: Constants.DATA_FETCH_ERROR})
    throw submitErrors(data)
  })
}
