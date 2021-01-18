import * as schema from './Schema';
import {
  getReferential,
  postReferential,
  delReferential,
  fileSave,
  fileDownload,
} from '../utils/Action';

export const fetchFiles = () => (dispatch) => {
  const uri = '/api/files';
  return getReferential(schema.arrayOfFiles, uri)(dispatch);
};

export const addFile = (data) => (dispatch) => {
  const uri = '/api/files';
  return postReferential(schema.file, uri, data)(dispatch);
};

export const deleteFile = (fileId) => (dispatch) => {
  const uri = `/api/files/${fileId}`;
  return delReferential(uri, 'files', fileId)(dispatch);
};

export const downloadFile = (fileId, filename) => (dispatch) => fileSave(`/api/files/${fileId}`, filename)(dispatch);

export const dataFile = (fileId) => (dispatch) => fileDownload(`/api/files/${fileId}`)(dispatch);

export const getImportFileSheetsName = (fileId) => (dispatch) => {
  const uri = `/api/files/sheets/${fileId}`;
  return getReferential(schema.fileSheet, uri)(dispatch);
};
