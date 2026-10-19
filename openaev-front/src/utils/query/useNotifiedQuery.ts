import { type QueryKey, useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useEffect } from 'react';

import { type Error as NotifiableError, notifyErrorHandler } from '../error/errorHandlerUtil';

// Data that changes while a screen is open also refetches on this interval, as a fallback for
// changes no invalidation announces. The library pauses it while the tab is in the background.
export const FALLBACK_REFETCH_INTERVAL_MS = 60_000;

/**
 * useQuery that shows the API error toast once, after the library's retries. The query function
 * must call the API with its own error toast turned off (the `notifyError` parameter of the
 * actions), or each attempt shows one.
 */
const useNotifiedQuery = <TQueryFnData, TData = TQueryFnData, TQueryKey extends QueryKey = QueryKey>(
  options: UseQueryOptions<TQueryFnData, Error, TData, TQueryKey>,
) => {
  const query = useQuery(options);
  const { error, errorUpdatedAt } = query;

  useEffect(() => {
    if (error) {
      notifyErrorHandler(error as unknown as NotifiableError);
    }
  }, [errorUpdatedAt]);

  return query;
};

export default useNotifiedQuery;
