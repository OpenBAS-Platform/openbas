import { schema } from 'normalizr';
import { delReferential, getReferential, postReferential, putReferential } from '../utils/Action';

const media = new schema.Entity('medias', {}, { idAttribute: 'media_id' });
const arrayOfMedias = new schema.Array(media);

export const fetchMedias = () => (dispatch) => {
  const uri = '/api/medias';
  return getReferential(arrayOfMedias, uri)(dispatch);
};

export const fetchMedia = (mediaId) => (dispatch) => {
  const uri = `/api/medias/${mediaId}`;
  return getReferential(media, uri)(dispatch);
};

export const updateMedia = (mediaId, data) => (dispatch) => putReferential(
  media,
  `/api/medias/${mediaId}`,
  data,
)(dispatch);

export const addMedia = (data) => (dispatch) => postReferential(media, '/api/medias', data)(dispatch);

export const deleteMedia = (mediaId) => (dispatch) => delReferential(
  `/api/medias/${mediaId}`,
  'medias',
  mediaId,
)(dispatch);
