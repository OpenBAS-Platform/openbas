import { type Query, type QueryClient } from '@tanstack/react-query';

import { type EntityChange, entityRefKey } from '../stream/entityChange';
import { type LiveMeta } from './live';

/** Changes received within this window are routed together. */
const BATCH_WINDOW_MS = 250;
const DEFAULT_THROTTLE_MS = 1000;

export interface ApplyOptions {
  /**
   * Invalidate right away, outside the batch window and the throttle: the user's own mutation must
   * show at once. Later changes of the same queries are throttled from this point.
   */
  immediate?: boolean;
}

export interface LiveRouter {
  /**
   * Describes entity changes (from the stream or a mutation): matching live queries are invalidated.
   * Resolves once the immediate refetches settle (immediately for batched changes).
   */
  applyChanges: (changes: EntityChange[], options?: ApplyOptions) => Promise<void>;
  /** Invalidates the live queries showing or listing one of the types; every live query when omitted. */
  invalidateType: (types?: string | string[]) => void;
  /** Invalidates every live query (e.g. after a reconnection that may have missed changes). */
  invalidateAllLive: () => void;
  /** Invalidates the live queries whose data was read before `timestamp` (stream session start). */
  invalidateReadBefore: (timestamp: number) => void;
  /** Marks every live query stale without fetching: a later mount, focus or poll refetches it. */
  markAllLiveStale: () => void;
  /** Drops the buffered changes, pending timers and cache subscription. The router stays usable afterwards. */
  dispose: () => void;
}

interface ThrottleState {
  lastRun: number;
  timer?: ReturnType<typeof setTimeout>;
}

/** The changes of one flush, indexed once for every query to match against. */
interface ChangeIndex {
  keys: Set<string>;
  // Types with a change on an id the query may not show: a created or deleted entity can enter or
  // leave a list, and changes its total.
  membershipTypes: Set<string>;
}

type LiveQuery = Query & { meta: { live: LiveMeta } };

const isLiveQuery = (query: Query): query is LiveQuery => query.meta?.live !== undefined;

const isDocumentHidden = () => typeof document !== 'undefined' && document.hidden;

// A fetch in flight (or paused while offline) will replace the data: its response may predate the change.
const isFetching = (query: Query) => query.state.fetchStatus !== 'idle';

const reportRefsError = (query: Query, error: unknown) => {
  if (import.meta.env.DEV && import.meta.env.MODE !== 'test') {
    // eslint-disable-next-line no-console
    console.error('[live] refs failed, the query is not live until fixed', query.queryKey, error);
  }
};

const safeRefs = (query: LiveQuery) => {
  const { live } = query.meta;
  const { data } = query.state;
  if (!live.refs || data === undefined) return [];
  try {
    const refs = live.refs(data);
    return Array.isArray(refs) ? refs : [];
  } catch (error) {
    reportRefsError(query, error);
    return [];
  }
};

/** Each change also updates its root; the root carries no action of its own. */
const expand = (changes: EntityChange[]): EntityChange[] =>
  changes.flatMap(change => (change.root
    ? [change, {
        ...change.root,
        action: 'update' as const,
      }]
    : [change]));

const indexChanges = (changes: EntityChange[]): ChangeIndex => ({
  keys: new Set(changes.map(entityRefKey)),
  membershipTypes: new Set(changes.filter(change => change.action !== 'update').map(change => change.type)),
});

/**
 * A query matches a change it shows (known id, any action), or a create/delete of a type it lists
 * (`collections`). An update of an entity it does not show cannot concern it.
 */
const matches = (query: LiveQuery, index: ChangeIndex) => {
  if (query.state.data === undefined) return false;
  if (query.meta.live.collections?.some(type => index.membershipTypes.has(type))) return true;
  return safeRefs(query).some(ref => index.keys.has(entityRefKey(ref)));
};

export const createLiveRouter = (queryClient: QueryClient): LiveRouter => {
  let buffer: EntityChange[] = [];
  let batchTimer: ReturnType<typeof setTimeout> | undefined;
  const throttles = new Map<string, ThrottleState>();
  // Changes received while a query was fetching, matched against the data that fetch returns.
  const parked = new Map<string, EntityChange[]>();
  // Queries due for an invalidation while a fetch was in flight: run once that fetch settles.
  const afterFetch = new Set<string>();
  let unsubscribeCache: (() => void) | undefined;

  const liveQueries = () => queryClient.getQueryCache().getAll().filter(isLiveQuery);

  const invalidateReady = (hashes: Set<string>, refetch = !isDocumentHidden()) => {
    if (hashes.size === 0) return Promise.resolve();
    return queryClient.invalidateQueries({
      predicate: query => hashes.has(query.queryHash),
      refetchType: refetch ? 'active' : 'none',
    }, {
      // Cancelling would restart the fetch on every change: under a steady flow of changes
      // (agents reporting in) a slow search would never complete.
      cancelRefetch: false,
    });
  };

  const throttleOf = (hash: string) => {
    const state = throttles.get(hash) ?? { lastRun: Number.NEGATIVE_INFINITY };
    throttles.set(hash, state);
    return state;
  };

  const pruneThrottles = () => {
    const cache = queryClient.getQueryCache();
    throttles.forEach((state, hash) => {
      if (state.timer === undefined && !cache.get(hash)) throttles.delete(hash);
    });
  };

  // eslint-disable-next-line prefer-const -- assigned below, used by the cache subscription
  let throttled: (queries: LiveQuery[]) => void;

  const ensureCacheSubscription = () => {
    if (unsubscribeCache !== undefined) return;
    unsubscribeCache = queryClient.getQueryCache().subscribe((event) => {
      const { query } = event;
      const hash = query.queryHash;
      if (event.type === 'removed') {
        afterFetch.delete(hash);
        parked.delete(hash);
        return;
      }
      if (event.type !== 'updated' || isFetching(query)) return;
      const due = afterFetch.delete(hash);
      const changes = parked.get(hash);
      parked.delete(hash);
      if (!isLiveQuery(query)) return;
      // The settled data is what the user sees now: only the parked changes it is concerned by
      // need another fetch, through the throttle like any other change.
      if (due || (changes !== undefined && matches(query, indexChanges(changes)))) {
        throttled([query]);
      }
    });
  };

  const invalidateNow = (hashes: Set<string>) => {
    const ready = new Set<string>();
    hashes.forEach((hash) => {
      const query = queryClient.getQueryCache().get(hash);
      if (query === undefined) return;
      if (isFetching(query)) {
        ensureCacheSubscription();
        afterFetch.add(hash);
      } else {
        ready.add(hash);
      }
    });
    return invalidateReady(ready);
  };

  // Leading edge when the query was not invalidated recently, otherwise one trailing run.
  throttled = (queries: LiveQuery[]) => {
    const now = Date.now();
    const immediate = new Set<string>();
    queries.forEach((query) => {
      const hash = query.queryHash;
      const state = throttleOf(hash);
      if (state.timer !== undefined) return;
      const throttleMs = query.meta.live.throttleMs ?? DEFAULT_THROTTLE_MS;
      const wait = state.lastRun + throttleMs - now;
      if (wait <= 0) {
        state.lastRun = now;
        immediate.add(hash);
      } else {
        state.timer = setTimeout(() => {
          state.timer = undefined;
          state.lastRun = Date.now();
          invalidateNow(new Set([hash]));
        }, wait);
      }
    });
    if (immediate.size > 0) invalidateNow(immediate);
    pruneThrottles();
  };

  // In-flight queries keep the changes for their response; settled ones are matched now.
  const route = (changes: EntityChange[]) => {
    const index = indexChanges(changes);
    const matching: LiveQuery[] = [];
    liveQueries().forEach((query) => {
      if (isFetching(query)) {
        ensureCacheSubscription();
        parked.set(query.queryHash, [...(parked.get(query.queryHash) ?? []), ...changes]);
      } else if (matches(query, index)) {
        matching.push(query);
      }
    });
    return matching;
  };

  const flush = () => {
    batchTimer = undefined;
    const changes = expand(buffer);
    buffer = [];
    if (changes.length === 0) return;
    const matching = route(changes);
    if (matching.length > 0) throttled(matching);
  };

  const applyChanges = (changes: EntityChange[], options?: ApplyOptions) => {
    if (changes.length === 0) return Promise.resolve();
    if (options?.immediate) {
      const now = Date.now();
      const hashes = new Set(route(expand(changes)).map(query => query.queryHash));
      hashes.forEach((hash) => {
        throttleOf(hash).lastRun = now;
      });
      return invalidateNow(hashes);
    }
    buffer.push(...changes);
    if (batchTimer === undefined) batchTimer = setTimeout(flush, BATCH_WINDOW_MS);
    return Promise.resolve();
  };

  const invalidateType = (types?: string | string[]) => {
    if (types === undefined) {
      throttled(liveQueries());
      return;
    }
    const wanted = new Set(Array.isArray(types) ? types : [types]);
    throttled(liveQueries().filter(query =>
      query.meta.live.collections?.some(type => wanted.has(type))
      || safeRefs(query).some(ref => wanted.has(ref.type))));
  };

  const invalidateAllLive = () => invalidateType();

  const invalidateReadBefore = (timestamp: number) => {
    throttled(liveQueries().filter(query => !isFetching(query)
      && query.state.data !== undefined && query.state.dataUpdatedAt < timestamp));
  };

  const markAllLiveStale = () => {
    invalidateReady(new Set(liveQueries().map(query => query.queryHash)), false);
  };

  const dispose = () => {
    if (batchTimer !== undefined) clearTimeout(batchTimer);
    batchTimer = undefined;
    buffer = [];
    throttles.forEach((state) => {
      if (state.timer !== undefined) clearTimeout(state.timer);
    });
    throttles.clear();
    afterFetch.clear();
    parked.clear();
    unsubscribeCache?.();
    unsubscribeCache = undefined;
  };

  return {
    applyChanges,
    invalidateType,
    invalidateAllLive,
    invalidateReadBefore,
    markAllLiveStale,
    dispose,
  };
};
