import { queryOptions } from '@tanstack/react-query';

import { STREAM_TYPES } from '../../utils/stream/streamTypes';
import { searchPlayerByIdAsOption } from './User';

export const userKeys = {
  all: ['users'] as const,
  playerLabels: () => [...userKeys.all, 'player-label'] as const,
  playerLabel: (id: string) => [...userKeys.playerLabels(), id] as const,
};

export const userQueries = {
  // Readable name of one player, resolved through the by-id options endpoint instead of loading
  // the whole player list. Null when the player no longer exists.
  playerLabel: (id: string) => queryOptions({
    queryKey: userKeys.playerLabel(id),
    queryFn: () => searchPlayerByIdAsOption([id], false)
      .then((result: {
        data: {
          id: string;
          label: string;
        }[];
      }) => result.data[0]?.label ?? null),
    meta: {
      live: {
        refs: () => [{
          type: STREAM_TYPES.USERS,
          id,
        }],
      },
    },
  }),
};
