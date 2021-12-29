import * as schema from './Schema';
import {
  getReferential,
  postReferential,
  delReferential,
  putReferential,
} from '../utils/Action';

export const fetchTags = () => (dispatch) => getReferential(schema.arrayOfTags, '/api/tag')(dispatch);

export const fetchTag = (tagId) => (dispatch) => getReferential(schema.tag, `/api/tag/${tagId}`)(dispatch);

export const addTag = (data) => (dispatch) => postReferential(schema.tag, '/api/tag', data)(dispatch);

export const updateTag = (userId, data) => (dispatch) => putReferential(schema.tag, `/api/tag/${userId}`, data)(dispatch);

export const deleteTag = (tagId) => (dispatch) => delReferential(`/api/tag/${tagId}`, 'tags', tagId)(dispatch);
