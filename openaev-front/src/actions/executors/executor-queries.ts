import { queryOptions, useQuery } from '@tanstack/react-query';

import { type ExecutorOutput } from '../../utils/api-types';
import { STREAM_TYPES } from '../../utils/stream/streamTypes';
import { listExecutors } from './executor-action';

const NO_EXECUTORS: Record<string, ExecutorOutput> = {};

export const executorKeys = {
  all: ['executors'] as const,
  lists: () => [...executorKeys.all, 'list'] as const,
  list: () => [...executorKeys.lists()] as const,
};

export const executorQueries = {
  // The current executors only (no upcoming ones): that is what the endpoint pages display.
  list: () => queryOptions({
    queryKey: executorKeys.list(),
    queryFn: () => listExecutors(false, false).then((result: { data: ExecutorOutput[] }) => result.data),
    meta: {
      live: {
        refs: data => (data as ExecutorOutput[]).map(executor => ({
          type: STREAM_TYPES.EXECUTORS,
          id: executor.executor_id,
        })),
        collections: [STREAM_TYPES.EXECUTORS],
      },
    },
  }),
};

// One map per fetched list, shared by every row that renders executors.
const executorMaps = new WeakMap<ExecutorOutput[], Record<string, ExecutorOutput>>();
const toExecutorsMap = (executors: ExecutorOutput[]) => {
  let map = executorMaps.get(executors);
  if (map === undefined) {
    map = Object.fromEntries(executors.map(executor => [executor.executor_id, executor]));
    executorMaps.set(executors, map);
  }
  return map;
};

/** All executors, indexed by id. Empty until the first load completes. */
export const useExecutorsMap = (): Record<string, ExecutorOutput> => {
  const { data } = useQuery({
    ...executorQueries.list(),
    select: toExecutorsMap,
  });
  return data ?? NO_EXECUTORS;
};
