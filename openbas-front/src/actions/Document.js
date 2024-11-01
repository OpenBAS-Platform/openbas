import { delReferential, getReferential, postReferential, putReferential, simplePostCall } from '../utils/Action';
import * as schema from './Schema';

export const fetchDocuments = () => dispatch => getReferential(schema.arrayOfDocuments, '/api/documents')(dispatch);

export const fetchDocument = documentId => dispatch => getReferential(schema.document, `/api/documents/${documentId}`)(dispatch);

export const searchDocuments = (paginationInput) => {
  const data = paginationInput;
  const uri = '/api/documents/search';
  return simplePostCall(uri, data);
};

export const addDocument = data => (dispatch) => {
  const uri = '/api/documents';
  return postReferential(schema.document, uri, data)(dispatch);
};

export const updateDocument = (documentId, data) => dispatch => putReferential(
  schema.document,
  `/api/documents/${documentId}`,
  data,
)(dispatch);

export const deleteDocument = documentId => (dispatch) => {
  const uri = `/api/documents/${documentId}`;
  return delReferential(uri, 'documents', documentId)(dispatch);
};

export const fetchPlayerDocuments = (exerciseId, userId = null) => dispatch => getReferential(
  schema.arrayOfDocuments,
  `/api/player/${exerciseId}/documents${userId ? `?userId=${userId}` : ''}`,
)(dispatch);
