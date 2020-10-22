import * as schema from './Schema'
import {getReferential, postReferential, delReferential, fileSave} from '../utils/Action'

export const addDocument = (data) => (dispatch) => {
  let uri = '/api/document'
  return postReferential(schema.document, uri, data)(dispatch)
}

export const searchDocument = (data) => (dispatch) => {
  let uri = '/api/document/search'
  return postReferential(schema.arrayOfDocument, uri, data)(dispatch)
}

export const saveDocument = (document_id, data) => (dispatch) => {
  let uri = '/api/document/save/' + document_id
  return postReferential(schema.document, uri, data)(dispatch)
}

export const getDocument = (document_id) => (dispatch) => {
  return getReferential(schema.document, '/api/document/' + document_id)(dispatch)
}

export const getDocumentTags = (document_id) => (dispatch) => {
  return getReferential(schema.arrayOfTags, '/api/document/' + document_id + '/tags')(dispatch)
}

export const getDocumentTagsExercise = (document_id) => (dispatch) => {
  return getReferential(schema.arrayOfExercises, '/api/document/' + document_id + '/tags/exercise')(dispatch)
}

export const editDocumentTags = (document_id, data) => (dispatch) => {
  let uri = '/api/document/' + document_id + '/save/tags'
  return postReferential(schema.document, uri, data)(dispatch)
}

export const editDocumentTagsExercise = (document_id, data) => (dispatch) => {
  let uri = '/api/document/' + document_id + '/save/tags/exercise'
  return postReferential(schema.document, uri, data)(dispatch)
}

export const deleteDocument = (document_id) => (dispatch) => {
  let uri = '/api/document/' + document_id
  return delReferential(uri, 'document', document_id)(dispatch)
}

export const downloadDocument = (document_id, document_name) => (dispatch) => {
  return fileSave('/api/files/' + document_id, document_name)(dispatch)
}
