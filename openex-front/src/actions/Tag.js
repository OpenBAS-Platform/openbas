import * as schema from './Schema';
import {
  getReferential,
  postReferential,
  delReferential,
  putReferential,
} from '../utils/Action';

export const fetchTags = () => (dispatch) => getReferential(schema.arrayOfTags, '/api/tags')(dispatch);

export const fetchTag = (tagId) => (dispatch) => getReferential(schema.tag, `/api/tags/${tagId}`)(dispatch);

export const addTag = (data) => (dispatch) => postReferential(schema.tag, '/api/tags', data)(dispatch);

export const updateTag = (userId, data) => (dispatch) => putReferential(schema.tag, `/api/tags/${userId}`, data)(dispatch);

export const deleteTag = (tagId) => (dispatch) => delReferential(`/api/tags/${tagId}`, 'tags', tagId)(dispatch);
