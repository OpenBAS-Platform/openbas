import { type QueryKey } from '@tanstack/react-query';

import type { InjectResultPayloadExecutionOutput, InjectTarget } from '../../utils/api-types';
import useNotifiedQuery, { FALLBACK_REFETCH_INTERVAL_MS } from '../../utils/query/useNotifiedQuery';
import { fetchInjectExecutionResult } from './inject-status-action';

// Query form of useFetchInjectExecutionResult, under the caller's key so that its invalidation
// refetches the result. Same contract: `undefined` while in flight, `null` once resolved empty or
// failed.
const useInjectExecutionResultQuery = (queryKey: QueryKey, injectId: string, target: InjectTarget | null) => {
  const resultQuery = useNotifiedQuery({
    queryKey: [...queryKey, 'execution-result', injectId, target?.target_id, target?.target_type],
    queryFn: () => fetchInjectExecutionResult(injectId, target?.target_id, target?.target_type, false)
      .then((result: { data?: InjectResultPayloadExecutionOutput }) => result.data ?? null),
    enabled: !!injectId && !!target?.target_id && !!target.target_type,
    // Traces grow while the inject runs: the interval backs up the invalidations.
    refetchInterval: FALLBACK_REFETCH_INTERVAL_MS,
  });
  return {
    injectExecutionResult: resultQuery.isError ? null : resultQuery.data,
    loading: resultQuery.isLoading,
  };
};

export default useInjectExecutionResultQuery;
