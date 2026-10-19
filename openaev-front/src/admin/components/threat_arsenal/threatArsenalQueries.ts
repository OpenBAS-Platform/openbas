import { type SearchPaginationInput } from '../../../utils/api-types';
import { payloadKey, PAYLOADS_LIST_KEY } from '../../../utils/query/keys';
import queryClient from '../../../utils/query/queryClient';

// Every query of the threat arsenal page (the actions, the sidebar facets) starts with
// PAYLOADS_LIST_KEY, so the topic 'list:payloads' refreshes the whole page at once.
export const threatArsenalFacetCountsKey = (input: SearchPaginationInput) => [...PAYLOADS_LIST_KEY, 'facets', input] as const;
// No data: the domain and author facets reload when this version changes (see useQueryVersion).
export const threatArsenalFacetsVersionKey = [...PAYLOADS_LIST_KEY, 'facets-version'] as const;

// One action's drawer, keyed by the action id (the injector contract id that
// GET /api/threat_arsenals/{id} reads), so the topic 'payload:<id>' refetches it.
export const threatArsenalActionOverviewKey = (actionId: string) => [...payloadKey(actionId), 'overview'] as const;

export const invalidatePayloadsList = () => queryClient.invalidateQueries({ queryKey: PAYLOADS_LIST_KEY });
export const invalidatePayload = (actionId: string) => queryClient.invalidateQueries({ queryKey: payloadKey(actionId) });
