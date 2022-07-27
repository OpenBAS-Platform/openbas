import { schema } from 'normalizr';
import {
  delReferential,
  getReferential,
  postReferential,
  putReferential,
} from '../utils/Action';

// region media
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
export const updateMedia = (mediaId, data) => (dispatch) => {
  const uri = `/api/medias/${mediaId}`;
  return putReferential(media, uri, data)(dispatch);
};
export const updateMediaLogos = (mediaId, data) => (dispatch) => {
  const uri = `/api/medias/${mediaId}/logos`;
  return putReferential(media, uri, data)(dispatch);
};
export const addMedia = (data) => (dispatch) => postReferential(media, '/api/medias', data)(dispatch);
export const deleteMedia = (mediaId) => (dispatch) => {
  const uri = `/api/medias/${mediaId}`;
  return delReferential(uri, 'medias', mediaId)(dispatch);
};
// endregion

// region article
const article = new schema.Entity(
  'articles',
  {},
  { idAttribute: 'article_id' },
);
const arrayOfArticles = new schema.Array(article);
export const fetchExerciseArticles = (exerciseId) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/articles`;
  return getReferential(arrayOfArticles, uri)(dispatch);
};
export const addExerciseArticle = (exerciseId, data) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/articles`;
  return postReferential(article, uri, data)(dispatch);
};
export const deleteExerciseArticle = (articleId) => (dispatch) => {
  const uri = `/api/articles/${articleId}`;
  return delReferential(uri, 'articles', articleId)(dispatch);
};
export const updateExerciseArticle = (articleId, data) => (dispatch) => {
  const uri = `/api/articles/${articleId}`;
  return putReferential(article, uri, data)(dispatch);
};
// endregion
