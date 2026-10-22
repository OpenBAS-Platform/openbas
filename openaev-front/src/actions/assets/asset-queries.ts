import { queryOptions } from '@tanstack/react-query';

import { type Page } from '../../components/common/queryable/Page';
import { buildSearchPagination } from '../../components/common/queryable/QueryableUtils';
import { type AgentOutput, type AssetGroupSimple, type EndpointOutput, type EndpointOverviewOutput, type SearchPaginationInput } from '../../utils/api-types';
import { type EntityChange, type EntityRef } from '../../utils/stream/entityChange';
import { STREAM_TYPES } from '../../utils/stream/streamTypes';
import { searchDistinctFindingsOnEndpoint } from '../findings/finding-actions';
import { fetchAssetOverview, fetchEndpointById, searchAssets } from './endpoint-actions';

// Endpoints are emitted as 'assets'; an agent change also reaches its asset.
export const ASSET_TYPE = STREAM_TYPES.ASSETS;
export const AGENT_TYPE = STREAM_TYPES.AGENTS;
export const ASSET_GROUP_TYPE = STREAM_TYPES.ASSET_GROUPS;
export const FINDING_TYPE = STREAM_TYPES.FINDINGS;

/**
 * A change for an entity whose id the caller does not know (bulk import). An unknown id with a
 * `create` action matches no row or detail: it only refreshes the lists and counters of that type.
 */
export const somethingCreated = (type: string): EntityChange => ({
  type,
  id: '',
  action: 'create',
});

// The backend's overview also carries the AI target connection metadata and the asset's markings;
// until the API types are regenerated they are declared here so the pages can render them.
export type AssetOverview = EndpointOverviewOutput & {
  ai_target_provider?: string;
  ai_target_modality?: string;
  ai_target_endpoint?: string;
  ai_target_model?: string;
  ai_target_system_prompt?: string;
  asset_markings?: string[];
};

interface AssetLike {
  asset_id: string;
  asset_agents?: Pick<AgentOutput, 'agent_id'>[];
  asset_asset_groups?: Pick<AssetGroupSimple, 'asset_group_id'>[];
}

/**
 * Everything one asset row/detail shows that has its own stream type: the asset, its agents and,
 * on the detail, its asset groups. Tags are not listed: `ItemTags` reads them from the live tags
 * query, and a change of the tags on an asset arrives as an update of the asset itself.
 */
export const assetRefs = (asset: AssetLike): EntityRef[] => [
  {
    type: ASSET_TYPE,
    id: asset.asset_id,
  },
  ...(asset.asset_agents ?? []).map(agent => ({
    type: AGENT_TYPE,
    id: agent.agent_id,
  })),
  ...(asset.asset_asset_groups ?? []).map(group => ({
    type: ASSET_GROUP_TYPE,
    id: group.asset_group_id,
  })),
];

export const assetListRefs = (page: Page<AssetLike>): EntityRef[] => page.content.flatMap(assetRefs);

export const assetKeys = {
  all: ['assets'] as const,
  lists: () => [...assetKeys.all, 'list'] as const,
  list: (input: SearchPaginationInput) => [...assetKeys.lists(), input] as const,
  details: () => [...assetKeys.all, 'detail'] as const,
  detail: (id: string) => [...assetKeys.details(), id] as const,
  editable: (id: string) => [...assetKeys.detail(id), 'editable'] as const,
  findingsTotal: (id: string) => [...assetKeys.detail(id), 'findings-total'] as const,
};

export const assetQueries = {
  // Unified inventory page: every asset type, with the agents and tags shown in the rows.
  list: (input: SearchPaginationInput) => queryOptions({
    queryKey: assetKeys.list(input),
    queryFn: () => searchAssets(input, false).then((result: { data: Page<EndpointOutput> }) => result.data),
    meta: {
      live: {
        refs: data => assetListRefs(data as Page<EndpointOutput>),
        collections: [ASSET_TYPE],
        // Agents on the page report in continuously: at most one list refetch every 3 s.
        throttleMs: 3000,
      },
    },
  }),
  detail: (id: string) => queryOptions({
    queryKey: assetKeys.detail(id),
    queryFn: () => fetchAssetOverview(id, false).then((result: { data: AssetOverview }) => result.data),
    meta: { live: { refs: data => assetRefs(data as AssetOverview) } },
  }),
  // Flat endpoint shape feeding the edit form. It is the snapshot the user edits, so it is read
  // once per opening of the drawer and never refreshed underneath the form (no live behaviour, no
  // refetch on focus or polling), and dropped as soon as the drawer closes.
  editable: (id: string) => queryOptions({
    queryKey: assetKeys.editable(id),
    queryFn: () => fetchEndpointById(id, false).then((result: { data: EndpointOutput }) => result.data),
    gcTime: 0,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchInterval: false,
  }),
  // Headline findings counter: a size-1 probe of the findings search, only the total is read.
  findingsTotal: (id: string) => queryOptions({
    queryKey: assetKeys.findingsTotal(id),
    queryFn: () => searchDistinctFindingsOnEndpoint(id, buildSearchPagination({ size: 1 }), false)
      .then((result: { data: { totalElements?: number } }) => result.data.totalElements ?? 0),
    meta: {
      live: {
        collections: [FINDING_TYPE],
        // Findings carry no root to their asset: any finding created or deleted anywhere matches,
        // and running simulations create them continuously. A headline counter can lag 10 s.
        throttleMs: 10_000,
      },
    },
  }),
};
