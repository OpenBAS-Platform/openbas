import { useQuery } from '@tanstack/react-query';
import { type Map as ImmutableMap } from 'immutable';

import { isXtmComposerIsReachable } from '../../../../actions/catalog/catalog-actions';
import { DATA_DELETE_BATCH_SUCCESS } from '../../../../constants/ActionTypes';
import { store } from '../../../../store';
import { INTEGRATIONS_LIST_KEY } from '../../../../utils/query/keys';
import queryClient from '../../../../utils/query/queryClient';
import { FALLBACK_REFETCH_INTERVAL_MS } from '../../../../utils/query/useNotifiedQuery';

// Every integration query starts with INTEGRATIONS_LIST_KEY, so the topic 'list:integrations'
// refetches the lists, the detail pages, the injector contracts and the instance logs together.
const integrationsSubKey = (...segments: string[]) => [...INTEGRATIONS_LIST_KEY, ...segments] as const;

export const injectorsKey = integrationsSubKey('injectors');
export const collectorsKey = integrationsSubKey('collectors');
export const executorsKey = integrationsSubKey('executors');
export const secretsProvidersKey = integrationsSubKey('secrets-providers');
export const catalogConnectorsKey = integrationsSubKey('catalog-connectors');
export const catalogConnectorKey = (catalogConnectorId: string) => integrationsSubKey('catalog-connector', catalogConnectorId);
export const xtmComposerReachableKey = integrationsSubKey('xtm-composer-reachable');

// One deployed connector's detail page (connector, catalog entry and managed instance).
export const connectorDetailKey = (connectorType: string, connectorId: string) => integrationsSubKey(connectorType, connectorId);
export const injectorContractsKey = (injectorId: string) => [...connectorDetailKey('injector', injectorId), 'contracts'] as const;
export const connectorInstanceLogsKey = (connectorInstanceId: string) => integrationsSubKey('connector-instance', connectorInstanceId, 'logs');

export const invalidateIntegrations = () => queryClient.invalidateQueries({ queryKey: INTEGRATIONS_LIST_KEY });

/**
 * Reachability of the Integration Manager, shared by every integration screen. Nothing announces
 * it, so it refreshes on the fallback interval. Null while unknown, false when the probe fails.
 */
export const useXtmComposerReachable = (enabled: boolean): boolean | null => {
  const { data, isError } = useQuery({
    queryKey: xtmComposerReachableKey,
    queryFn: () => isXtmComposerIsReachable().then(({ data: reachable }: { data: boolean }) => reachable),
    refetchInterval: FALLBACK_REFETCH_INTERVAL_MS,
    // The call shows its own error toast: one attempt only.
    retry: false,
    enabled,
  });
  if (isError) {
    return false;
  }
  return data ?? null;
};

/**
 * Loads every connector of one type into the store, then evicts the ones the answer no longer
 * holds (deleted elsewhere): a refetch alone only merges. `entityType` is the store entity name
 * ('injectors', 'collectors', 'executors', 'secretsproviders').
 */
export const loadConnectorsEvictingDeleted = async (load: () => Promise<unknown>, entityType: string) => {
  const payload = await load() as { result?: string[] } | undefined;
  const freshIds = new Set<string>(payload?.result ?? []);
  const entities = store.getState().referential.getIn(['entities', entityType]) as ImmutableMap<string, unknown> | undefined;
  if (!entities) {
    return;
  }
  const staleDeletes = entities
    .keySeq()
    .filter(id => !freshIds.has(id))
    .map(id => ({
      id,
      type: entityType,
    }))
    .toArray();
  if (staleDeletes.length > 0) {
    store.dispatch({
      type: DATA_DELETE_BATCH_SUCCESS,
      payload: staleDeletes,
    });
  }
};
