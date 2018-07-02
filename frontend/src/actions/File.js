import * as schema from './Schema'
import {getReferential, postReferential, delReferential, fileSave, fileDownload} from '../utils/Action'

export const fetchFiles = () => (dispatch) => {
  let uri = '/api/files'
  return getReferential(schema.arrayOfFiles, uri)(dispatch)
}

export const addFile = (data) => (dispatch) => {
  let uri = '/api/files'
  return postReferential(schema.file, uri, data)(dispatch)
}

export const deleteFile = (fileId) => (dispatch) => {
  let uri = '/api/files/' + fileId
  return delReferential(uri, 'files', fileId)(dispatch)
}

export const downloadFile = (fileId, filename) => (dispatch) => {
  return fileSave('/api/files/' + fileId, filename)(dispatch)
}

export const dataFile = (fileId) => (dispatch) => {
  return fileDownload('/api/files/' + fileId)(dispatch)
}
