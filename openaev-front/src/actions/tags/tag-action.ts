import type { Dispatch } from 'redux';

import { delReferential, getReferential, postReferential, putReferential, simpleCall, simplePostCall } from '../../utils/Action';
import type { SearchPaginationInput, Tag, TagCreateInput, TagUpdateInput } from '../../utils/api-types';
import { publishChanges } from '../../utils/query/liveRouterContext';
import { STREAM_TYPES } from '../../utils/stream/streamTypes';
import { arrayOfTags, tag } from './tag-schema';

const TAG_URI = '/api/tags';

// -- CREATE --

export const addTag = (data: TagCreateInput) => (dispatch: Dispatch) => {
  return postReferential(tag, TAG_URI, data)(dispatch).then((result: { result?: unknown }) => {
    // Pages reading tags from the query cache show the new tag at once, without the stream echo.
    if (typeof result?.result === 'string') {
      publishChanges([{
        type: STREAM_TYPES.TAGS,
        id: result.result,
        action: 'create',
      }]);
    }
    return result;
  });
};

// -- READ --

export const fetchTags = () => (dispatch: Dispatch) => {
  return getReferential(arrayOfTags, TAG_URI)(dispatch);
};

// Plain read (no store dispatch) backing the query cache.
export const listTags = (notifyError = true) => {
  return simpleCall(TAG_URI, undefined, notifyError);
};

// -- SEARCH --

export const searchTags = (searchPaginationInput: SearchPaginationInput) => {
  return simplePostCall(`${TAG_URI}/search`, searchPaginationInput);
};

// -- UPDATE --

export const updateTag = (tagId: Tag['tag_id'], data: TagUpdateInput) => (dispatch: Dispatch) => {
  return putReferential(tag, `${TAG_URI}/${tagId}`, data)(dispatch);
};

// -- DELETE --

export const deleteTag = (tagId: Tag['tag_id']) => (dispatch: Dispatch) => {
  return delReferential(`${TAG_URI}/${tagId}`, 'tags', tagId)(dispatch);
};

// -- OPTIONS --

export const searchTagAsOption = (searchText: string = '') => {
  const params = { searchText };
  return simpleCall(`${TAG_URI}/options`, { params });
};

export const searchTagByIdAsOption = (ids: string[]) => {
  return simplePostCall(`${TAG_URI}/options`, ids);
};
