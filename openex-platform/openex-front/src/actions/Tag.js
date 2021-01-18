import * as schema from './Schema';
import {
  getReferential,
  postReferential,
  delReferential,
} from '../utils/Action';

export const fetchTags = () => (dispatch) => getReferential(schema.arrayOfTags, '/api/tag')(dispatch);

export const addTag = (data) => (dispatch) => {
  const uri = '/api/tag';
  return postReferential(schema.tag, uri, data)(dispatch);
};

export const deleteTag = (tagId) => (dispatch) => {
  const uri = `/api/tag/${tagId}`;
  return delReferential(uri, 'tag', tagId)(dispatch);
};
