import { type QueryKey, useQuery } from '@tanstack/react-query';

interface Options {
  enabled?: boolean;
  refetchInterval?: number | false;
}

/**
 * Query mode for data that lives in the Redux store: the query only runs the loader that fills
 * the store (a dispatched fetch action), and components keep reading the store. A stream
 * invalidation of the key then refreshes the store and every component reading it. The query's
 * own data is unused.
 *
 * Fetch actions show their own error toast, so a failed load is not retried (one toast only).
 */
const useStoreQuery = (queryKey: QueryKey, load: () => Promise<unknown>, { enabled = true, refetchInterval = false }: Options = {}) => {
  const { isPending, isFetching } = useQuery({
    queryKey,
    queryFn: () => load().then(() => null),
    enabled,
    refetchInterval,
    retry: false,
  });
  return {
    isPending: enabled && isPending,
    isFetching,
  };
};

export default useStoreQuery;
