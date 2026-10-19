import { type QueryKey, useQuery } from '@tanstack/react-query';
import { type Map as ImmutableMap } from 'immutable';

import { DATA_DELETE_BATCH_SUCCESS } from '../../../constants/ActionTypes';
import { store } from '../../../store';
import { COMPONENTS_LIST_KEY } from '../../../utils/query/keys';
import queryClient from '../../../utils/query/queryClient';

// Every components query (documents, channels, challenges, lessons templates, phishing templates,
// and their detail pages) starts with COMPONENTS_LIST_KEY, so the topic 'list:components'
// refetches all of them at once.
const componentsSubKey = (...segments: string[]) => [...COMPONENTS_LIST_KEY, ...segments] as const;

export const documentsKey = componentsSubKey('documents');
export const channelsKey = componentsSubKey('channels');
export const channelKey = (channelId: string) => componentsSubKey('channel', channelId);
export const channelEntityKey = (channelId: string) => [...channelKey(channelId), 'channel'] as const;
export const channelDocumentsKey = (channelId: string) => [...channelKey(channelId), 'documents'] as const;
export const challengesKey = componentsSubKey('challenges');
export const lessonsTemplatesKey = componentsSubKey('lessons-templates');
export const lessonsTemplateKey = (lessonsTemplateId: string) => componentsSubKey('lessons-template', lessonsTemplateId);
export const lessonsTemplateEntityKey = (lessonsTemplateId: string) => [...lessonsTemplateKey(lessonsTemplateId), 'template'] as const;
export const lessonsTemplateContentKey = (lessonsTemplateId: string) => [...lessonsTemplateKey(lessonsTemplateId), 'content'] as const;
export const phishingLandingPagesKey = componentsSubKey('phishing-landing-pages');
export const phishingLandingPageKey = (landingPageId: string) => componentsSubKey('phishing-landing-page', landingPageId);
export const phishingEmailTemplatesKey = componentsSubKey('phishing-email-templates');
export const phishingEmailTemplateKey = (emailTemplateId: string) => componentsSubKey('phishing-email-template', emailTemplateId);

export const invalidateComponents = () => queryClient.invalidateQueries({ queryKey: COMPONENTS_LIST_KEY });

type StoreEntity = ImmutableMap<string, unknown>;

/**
 * Loads entities into the store, then evicts the ones of the same type the answer no longer holds
 * (deleted elsewhere): a refetch alone only merges. `belongs` narrows the eviction to the entities
 * the load covers (for example the categories of one template); without it, every entity of the
 * type is covered.
 */
export const loadEvictingDeleted = async (
  load: () => Promise<unknown>,
  entityType: string,
  belongs: (entity: StoreEntity) => boolean = () => true,
) => {
  const payload = await load() as { result?: string[] | string } | undefined;
  const result = payload?.result;
  const freshIds = new Set<string>(Array.isArray(result) ? result : []);
  const entities = store.getState().referential.getIn(['entities', entityType]) as ImmutableMap<string, StoreEntity> | undefined;
  if (!entities) {
    return;
  }
  const staleDeletes = entities
    .filter((entity, id) => !freshIds.has(id) && belongs(entity))
    .keySeq()
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

/**
 * Query mode for components data kept in the Redux store: the query only runs the loader that fills
 * the store, and components keep reading the store. Unlike useStoreQuery it exposes the error, so a
 * detail screen can tell a deleted or forbidden entity (4xx) from a loading one. The fetch actions
 * show their own error toast: no retry, so one toast per failed load.
 */
export const useComponentsStoreQuery = (queryKey: QueryKey, load: () => Promise<unknown>, enabled: boolean) => {
  const { isPending, error } = useQuery({
    queryKey,
    queryFn: () => load().then(() => null),
    enabled,
    retry: false,
  });
  return {
    isPending: enabled && isPending,
    error: enabled ? error : null,
  };
};
