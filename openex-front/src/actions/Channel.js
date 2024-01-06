import { schema } from 'normalizr';
import { delReferential, getReferential, postReferential, putReferential } from '../utils/Action';
import { channelReader } from './Schema';

// region channels
const channel = new schema.Entity('channels', {}, { idAttribute: 'channel_id' });
const arrayOfChannels = new schema.Array(channel);
export const fetchChannels = () => (dispatch) => {
  const uri = '/api/channels';
  return getReferential(arrayOfChannels, uri)(dispatch);
};
export const fetchChannel = (channelId) => (dispatch) => {
  const uri = `/api/channels/${channelId}`;
  return getReferential(channel, uri)(dispatch);
};
export const updateChannel = (channelId, data) => (dispatch) => {
  const uri = `/api/channels/${channelId}`;
  return putReferential(channel, uri, data)(dispatch);
};
export const updateChannelLogos = (channelId, data) => (dispatch) => {
  const uri = `/api/channels/${channelId}/logos`;
  return putReferential(channel, uri, data)(dispatch);
};
export const addChannel = (data) => (dispatch) => postReferential(channel, '/api/channels', data)(dispatch);
export const deleteChannel = (channelId) => (dispatch) => {
  const uri = `/api/channels/${channelId}`;
  return delReferential(uri, 'channels', channelId)(dispatch);
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
export const deleteExerciseArticle = (exerciseId, articleId) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/articles/${articleId}`;
  return delReferential(uri, 'articles', articleId)(dispatch);
};
export const updateExerciseArticle = (exerciseId, articleId, data) => (dispatch) => {
  const uri = `/api/exercises/${exerciseId}/articles/${articleId}`;
  return putReferential(article, uri, data)(dispatch);
};
export const fetchPlayerChannel = (exerciseId, channelId, userId) => (dispatch) => {
  const uri = `/api/player/channels/${exerciseId}/${channelId}?userId=${userId}`;
  return getReferential(channelReader, uri)(dispatch);
};
export const fetchObserverChannel = (exerciseId, channelId) => (dispatch) => {
  const uri = `/api/observer/channels/${exerciseId}/${channelId}`;
  return getReferential(channelReader, uri)(dispatch);
};

// endregion
