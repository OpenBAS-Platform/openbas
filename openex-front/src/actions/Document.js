import * as schema from './Schema';
import {
  getReferential,
  postReferential,
  delReferential,
  fileSave, putReferential,
} from '../utils/Action';

export const addDocument = (data) => (dispatch) => {
  const uri = '/api/documents';
  return postReferential(schema.document, uri, data)(dispatch);
};

export const searchDocument = (data) => (dispatch) => {
  const uri = '/api/documents';
  return getReferential(schema.arrayOfDocument, uri, data)(dispatch);
};

export const saveDocument = (documentId, data) => (dispatch) => {
  const uri = `/api/documents/${documentId}`;
  return putReferential(schema.document, uri, data)(dispatch);
};

export const getDocument = (documentId) => (dispatch) => getReferential(schema.document, `/api/document/${documentId}`)(dispatch);

export const getDocumentTags = (documentId) => (dispatch) => getReferential(
  schema.arrayOfTags,
  `/api/documents/${documentId}/tags`,
)(dispatch);

export const editDocumentTags = (documentId, data) => (dispatch) => {
  const uri = `/api/documents/${documentId}/tags`;
  return putReferential(schema.document, uri, data)(dispatch);
};

export const deleteDocument = (documentId) => (dispatch) => {
  const uri = `/api/documents/${documentId}`;
  return delReferential(uri, 'document', documentId)(dispatch);
};

export const downloadDocument = (documentId, documentName) => (dispatch) => fileSave(`/api/files/${documentId}`, documentName)(dispatch);
