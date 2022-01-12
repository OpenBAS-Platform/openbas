import * as schema from './Schema';
import {
  getReferential,
  postReferential,
  delReferential,
  putReferential,
  fileDownload,
} from '../utils/Action';

export const fetchDocuments = () => (dispatch) => getReferential(schema.arrayOfDocuments, '/api/documents')(dispatch);

export const fetchDocument = (documentId) => (dispatch) => getReferential(schema.document, `/api/documents/${documentId}`)(dispatch);

export const addDocument = (data) => (dispatch) => {
  const uri = '/api/documents';
  return postReferential(schema.document, uri, data)(dispatch);
};

export const updateDocument = (documentId, data) => (dispatch) => putReferential(
  schema.document,
  `/api/documents/${documentId}`,
  data,
)(dispatch);

export const deleteDocument = (documentId) => (dispatch) => {
  const uri = `/api/documents/${documentId}`;
  return delReferential(uri, 'documents', documentId)(dispatch);
};

export const downloadDocument = (documentId) => (dispatch) => fileDownload(`/api/documents/${documentId}/file`)(dispatch);
