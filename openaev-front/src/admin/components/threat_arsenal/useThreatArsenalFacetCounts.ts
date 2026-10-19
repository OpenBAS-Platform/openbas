import { keepPreviousData } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { fetchThreatArsenalFacetCounts } from '../../../actions/threat_arsenals/threatArsenal-actions';
import { type SearchPaginationInput } from '../../../utils/api-types';
import { retryUnlessClientError } from '../../../utils/query/queryErrors';
import useNotifiedQuery, { FALLBACK_REFETCH_INTERVAL_MS } from '../../../utils/query/useNotifiedQuery';
import { threatArsenalFacetCountsKey } from './threatArsenalQueries';

export interface ThreatArsenalFacetCounts {
  platforms: Record<string, number>;
  statuses: Record<string, number>;
}

/**
 * Platform + payload-status counts under the current filters (backend
 * aggregation), so the fixed-universe sidebar facets show live counts like the
 * domain and author facets. Returns `null` until the first response lands, so
 * the sidebar can skip the count badges instead of flashing everything at 0.
 *
 * With `liveUpdates`, the counts are a query under the threat arsenal list key,
 * refetched with the list by a stream invalidation or the fallback interval.
 */
const useThreatArsenalFacetCounts = (
  searchPaginationInput: SearchPaginationInput,
  liveUpdates = false,
): ThreatArsenalFacetCounts | null => {
  const [counts, setCounts] = useState<ThreatArsenalFacetCounts | null>(null);

  const { data } = useNotifiedQuery({
    queryKey: threatArsenalFacetCountsKey(searchPaginationInput),
    queryFn: () => fetchThreatArsenalFacetCounts(searchPaginationInput, false)
      .then(response => (response.data ?? null) as ThreatArsenalFacetCounts | null),
    enabled: liveUpdates,
    placeholderData: keepPreviousData,
    retry: retryUnlessClientError,
    refetchInterval: FALLBACK_REFETCH_INTERVAL_MS,
  });

  useEffect(() => {
    if (liveUpdates) {
      return undefined;
    }
    let cancelled = false;
    fetchThreatArsenalFacetCounts(searchPaginationInput)
      .then((response) => {
        if (!cancelled) setCounts((response.data ?? null) as ThreatArsenalFacetCounts | null);
      })
      .catch(() => {
        if (!cancelled) setCounts(null);
      });
    return () => {
      cancelled = true;
    };
  }, [searchPaginationInput, liveUpdates]);

  return liveUpdates ? (data ?? null) : counts;
};

export default useThreatArsenalFacetCounts;
