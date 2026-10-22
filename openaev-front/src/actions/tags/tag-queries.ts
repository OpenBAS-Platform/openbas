import { queryOptions, useQuery } from '@tanstack/react-query';

import { type Tag } from '../../utils/api-types';
import { STREAM_TYPES } from '../../utils/stream/streamTypes';
import { listTags } from './tag-action';

export const TAG_TYPE = STREAM_TYPES.TAGS;
const NO_TAGS: Record<string, Tag> = {};

export const tagKeys = {
  all: ['tags'] as const,
  lists: () => [...tagKeys.all, 'list'] as const,
  list: () => [...tagKeys.lists()] as const,
};

export const tagQueries = {
  list: () => queryOptions({
    queryKey: tagKeys.list(),
    queryFn: () => listTags(false).then((result: { data: Tag[] }) => result.data),
    meta: {
      live: {
        refs: data => (data as Tag[]).map(tag => ({
          type: TAG_TYPE,
          id: tag.tag_id,
        })),
        collections: [TAG_TYPE],
      },
    },
  }),
};

// One map per fetched list, shared by every row that renders tags.
const tagMaps = new WeakMap<Tag[], Record<string, Tag>>();
const toTagsMap = (tags: Tag[]) => {
  let map = tagMaps.get(tags);
  if (map === undefined) {
    map = Object.fromEntries(tags.map(tag => [tag.tag_id, tag]));
    tagMaps.set(tags, map);
  }
  return map;
};

/** All tags, indexed by id. Empty until the first load completes. */
export const useTagsMap = (): Record<string, Tag> => {
  const { data } = useQuery({
    ...tagQueries.list(),
    select: toTagsMap,
  });
  return data ?? NO_TAGS;
};
