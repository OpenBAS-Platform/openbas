import { atomicTestingKey } from '../../../../utils/query/keys';
import queryClient from '../../../../utils/query/queryClient';

export { isClientError, retryUnlessClientError } from '../../../../utils/query/queryErrors';

// Queries of the atomic testing screen also refetch on this interval, as a fallback for changes no
// invalidation announces. The library pauses it while the tab is in the background.
export const ATOMIC_TESTING_REFETCH_INTERVAL_MS = 60_000;

const OVERVIEW_SEGMENT = 'overview';

export const atomicTestingOverviewKey = (injectId: string) => [...atomicTestingKey(injectId), OVERVIEW_SEGMENT] as const;
export const atomicTestingDriftKey = (injectId: string) => [...atomicTestingKey(injectId), 'expectations-drift'] as const;

// Refetches every query of the atomic testing screen (targets, findings, drift, ...), except the
// overview when the caller has just written it into the cache.
export const invalidateAtomicTesting = (injectId: string, options: { exceptOverview?: boolean } = {}) => queryClient.invalidateQueries({
  queryKey: atomicTestingKey(injectId),
  predicate: query => !options.exceptOverview || query.queryKey[2] !== OVERVIEW_SEGMENT,
});
