import { type Theme } from '@mui/material/styles';
import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { adHocSeries } from '../../../actions/dashboards/dashboard-action';
import { generateFilterId } from '../../../components/common/queryable/filter/FilterUtils';
import { type EsSeries, type Filter, type FilterGroup, type Widget } from '../../../utils/api-types';

export interface PostureScoreEntry {
  success: number;
  failed: number;
}

/**
 * Severity band color for a posture score (kept in sync with the severity
 * bands of the PostureScore hero dialog).
 */
export const postureBandColor = (theme: Theme, score: number | null): string => {
  if (score === null) return theme.palette.text.secondary;
  if (score >= 75) return theme.palette.success.main;
  if (score >= 50) return theme.palette.warning.main;
  if (score >= 25) return '#ff7043';
  return theme.palette.error.main;
};

const filter = (key: string, values: string[]): Filter => ({
  id: generateFilterId(),
  key,
  mode: 'or',
  values,
  operator: 'eq',
});

const group = (...filters: Filter[]): FilterGroup => ({
  mode: 'and',
  filters,
});

// Per-bucket totals of a named series, keyed by the raw bucket key (the scoped
// entity id for side fields).
const bucketTotals = (series: EsSeries[] | null, name: string): Record<string, number> => {
  const data = (series ?? []).find(s => s.label === name)?.data ?? [];
  return data.reduce<Record<string, number>>((acc, bucket) => {
    const key = bucket.key ?? bucket.label;
    if (key) acc[key] = (acc[key] ?? 0) + (bucket.value ?? 0);
    return acc;
  }, {});
};

const postureSeriesConfig = (scopeField: string, ids: string[]) => {
  const expectation = (status: string) => group(
    filter('base_entity', ['expectation-inject']),
    filter(scopeField, ids),
    filter('inject_expectation_status', [status]),
  );
  return {
    title: '',
    field: scopeField,
    series: ['SUCCESS', 'FAILED'].map(status => ({
      name: status,
      filter: expectation(status),
    })),
    mode: 'structural',
    stacked: false,
    limit: Math.max(ids.length, 10),
    widget_configuration_type: 'structural-histogram',
    time_range: 'ALL_TIME',
    date_attribute: 'base_created_at',
  } as unknown as Widget['widget_config'];
};

const scoresFromSeries = (series: EsSeries[] | null, ids: string[]): Record<string, PostureScoreEntry> => {
  const successMap = bucketTotals(series, 'SUCCESS');
  const failedMap = bucketTotals(series, 'FAILED');
  return ids.reduce<Record<string, PostureScoreEntry>>((acc, id) => {
    acc[id] = {
      success: successMap[id] ?? 0,
      failed: failedMap[id] ?? 0,
    };
    return acc;
  }, {});
};

export const postureKeys = {
  all: ['posture-scores'] as const,
  scores: (scopeField: string, ids: string[]) => [...postureKeys.all, scopeField, ids] as const,
};

export const postureQueries = {
  // Posture comes from the dashboard engine, not from an entity the stream reports, so this query
  // declares no live behaviour: it is refetched when the page's ids change.
  scores: (scopeField: string, ids: string[]) => queryOptions({
    queryKey: postureKeys.scores(scopeField, ids),
    queryFn: () => adHocSeries(postureSeriesConfig(scopeField, ids), undefined, false).then((result: { data: EsSeries[] }) => result.data),
    enabled: ids.length > 0,
    placeholderData: keepPreviousData,
  }),
};

/**
 * Batched flavour of useExpectationPosture for list pages: one dashboard-engine
 * query returns the validated (SUCCESS / FAILED) expectation counts of every
 * entity of the current page, bucketed by the scoping side field. Feeds the
 * per-row posture score column.
 *
 * @param scopeField ES side field carrying the scope (e.g. `base_asset_side`,
 *                   `base_asset_group_side`).
 * @param entityIds  The ids of the currently displayed page.
 */
const usePostureScores = (
  scopeField: string,
  entityIds: string[],
): {
  loading: boolean;
  scores: Record<string, PostureScoreEntry>;
} => {
  const [series, setSeries] = useState<EsSeries[] | null>(null);

  // Stable dependency: the ids array is rebuilt on every render by callers.
  const idsKey = entityIds.join(',');

  useEffect(() => {
    const ids = idsKey ? idsKey.split(',') : [];
    if (ids.length === 0) {
      setSeries([]);
      return undefined;
    }
    setSeries(null);
    const config = postureSeriesConfig(scopeField, ids);
    // Cancellation guard: on rapid pagination an out-of-order response must not
    // overwrite the scores of the page currently displayed.
    let cancelled = false;
    adHocSeries(config)
      .then((result: { data: EsSeries[] }) => {
        if (!cancelled) setSeries(result.data);
      })
      .catch(() => {
        if (!cancelled) setSeries([]);
      });
    return () => {
      cancelled = true;
    };
  }, [scopeField, idsKey]);

  const scores = useMemo(
    () => scoresFromSeries(series, idsKey ? idsKey.split(',') : []),
    [series, idsKey],
  );

  return {
    loading: series === null,
    scores,
  };
};

/**
 * Query-backed flavour of usePostureScores: same result shape, cached per page of ids. While the
 * scores of a new page load, the previous ones stay in place and `loading` is true.
 */
export const usePostureScoresQuery = (
  scopeField: string,
  entityIds: string[],
): {
  loading: boolean;
  scores: Record<string, PostureScoreEntry>;
} => {
  const { data, isPending, isPlaceholderData } = useQuery(postureQueries.scores(scopeField, entityIds));
  const idsKey = entityIds.join(',');
  const scores = useMemo(
    () => scoresFromSeries(data ?? null, idsKey ? idsKey.split(',') : []),
    [data, idsKey],
  );
  return {
    loading: entityIds.length > 0 && (isPending || isPlaceholderData),
    scores,
  };
};

export default usePostureScores;
