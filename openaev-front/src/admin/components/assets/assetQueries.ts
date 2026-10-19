import { type QueryKey, useQuery } from '@tanstack/react-query';

import { ASSET_GROUPS_LIST_KEY, assetGroupKey, assetKey, ASSETS_LIST_KEY } from '../../../utils/query/keys';
import queryClient from '../../../utils/query/queryClient';

// Sub-resource keys of one asset (or asset group) detail screen. They all start with
// assetKey(id) / assetGroupKey(id), so the topic 'asset:<id>' / 'asset-group:<id>' refetches every
// query of the screen at once.
const assetSubKey = (assetId: string, segment: string) => [...assetKey(assetId), segment] as const;
const assetGroupSubKey = (assetGroupId: string, segment: string) => [...assetGroupKey(assetGroupId), segment] as const;

export const assetOverviewKey = (assetId: string) => assetSubKey(assetId, 'overview');
export const assetFindingsKey = (assetId: string) => assetSubKey(assetId, 'findings');
export const assetInjectsKey = (assetId: string) => assetSubKey(assetId, 'injects');
export const assetExpectationsKey = (assetId: string) => assetSubKey(assetId, 'expectations');
export const assetMissedExpectationsKey = (assetId: string) => assetSubKey(assetId, 'missed-expectations');
// No data: see useQueryVersion.
export const assetVersionKey = (assetId: string) => assetSubKey(assetId, 'version');

export const assetGroupEntityKey = (assetGroupId: string) => assetGroupSubKey(assetGroupId, 'asset-group');
export const assetGroupMembersKey = (assetGroupId: string) => assetGroupSubKey(assetGroupId, 'members');
export const assetGroupFindingsKey = (assetGroupId: string) => assetGroupSubKey(assetGroupId, 'findings');
export const assetGroupInjectsKey = (assetGroupId: string) => assetGroupSubKey(assetGroupId, 'injects');
export const assetGroupExpectationsKey = (assetGroupId: string) => assetGroupSubKey(assetGroupId, 'expectations');
export const assetGroupVersionKey = (assetGroupId: string) => assetGroupSubKey(assetGroupId, 'version');

// Per-row posture scores of the lists: refetched with the list they belong to.
export const assetsPostureVersionKey = [...ASSETS_LIST_KEY, 'posture-version'] as const;
export const assetGroupsPostureVersionKey = [...ASSET_GROUPS_LIST_KEY, 'posture-version'] as const;

export const invalidateAssetsList = () => queryClient.invalidateQueries({ queryKey: ASSETS_LIST_KEY });
export const invalidateAssetGroupsList = () => queryClient.invalidateQueries({ queryKey: ASSET_GROUPS_LIST_KEY });
export const invalidateAsset = (assetId: string) => queryClient.invalidateQueries({ queryKey: assetKey(assetId) });
export const invalidateAssetGroup = (assetGroupId: string) => queryClient.invalidateQueries({ queryKey: assetGroupKey(assetGroupId) });

/**
 * Version of data that is not fetched through queries (dashboard-engine widgets, hero totals).
 * The query holds no data: an invalidation of its key, or the optional interval, bumps the
 * version, and the hooks given it refetch. It never goes stale on its own, so a window refocus does
 * not reload every widget. Returns undefined when disabled, which leaves those hooks as they were.
 */
export const useQueryVersion = (queryKey: QueryKey, enabled: boolean, refetchInterval: number | false = false): number | undefined => {
  const { data } = useQuery({
    queryKey,
    queryFn: () => Date.now(),
    initialData: 0,
    staleTime: Infinity,
    refetchInterval,
    enabled,
  });
  return enabled ? data : undefined;
};
