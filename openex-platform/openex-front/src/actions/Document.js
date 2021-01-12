import * as schema from './Schema';
// eslint-disable-next-line import/no-cycle
import {
  getReferential,
  postReferential,
  delReferential,
  fileSave,
} from '../utils/Action';

export const addDocument = (data) => (dispatch) => {
  const uri = '/api/document';
  return postReferential(schema.document, uri, data)(dispatch);
};

export const searchDocument = (data) => (dispatch) => {
  const uri = '/api/document/search';
  return postReferential(schema.arrayOfDocument, uri, data)(dispatch);
};

export const saveDocument = (documentId, data) => (dispatch) => {
  const uri = `/api/document/save/${documentId}`;
  return postReferential(schema.document, uri, data)(dispatch);
};

export const getDocument = (documentId) => (dispatch) => getReferential(schema.document, `/api/document/${documentId}`)(dispatch);

export const getDocumentTags = (documentId) => (dispatch) => getReferential(
  schema.arrayOfTags,
  `/api/document/${documentId}/tags`,
)(dispatch);

export const getDocumentTagsExercise = (documentId) => (dispatch) => getReferential(
  schema.arrayOfExercises,
  `/api/document/${documentId}/tags/exercise`,
)(dispatch);

export const editDocumentTags = (documentId, data) => (dispatch) => {
  const uri = `/api/document/${documentId}/save/tags`;
  return postReferential(schema.document, uri, data)(dispatch);
};

export const editDocumentTagsExercise = (documentId, data) => (dispatch) => {
  const uri = `/api/document/${documentId}/save/tags/exercise`;
  return postReferential(schema.document, uri, data)(dispatch);
};

export const deleteDocument = (documentId) => (dispatch) => {
  const uri = `/api/document/${documentId}`;
  return delReferential(uri, 'document', documentId)(dispatch);
};

export const downloadDocument = (documentId, documentName) => (dispatch) => fileSave(`/api/files/${documentId}`, documentName)(dispatch);
