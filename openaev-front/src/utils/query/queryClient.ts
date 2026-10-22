import { type Query, QueryCache, QueryClient } from '@tanstack/react-query';

import { type Error as ApiError, notifyErrorHandler } from '../error/errorHandlerUtil';
import { isStreamHealthy } from '../stream/streamClient';
import { hasHttpStatus, isNotFoundError } from './httpErrors';

const STALE_TIME_MS = 30_000;
const POLLING_INTERVAL_MS = 30_000;
const MAX_RETRIES = 2;

/**
 * At most two retries, only on network failures, and only while the stream is up. Any HTTP answer
 * is final. A network failure while the stream is down means the platform is unreachable: the
 * fallback polling already tries again every 30 s, retrying each poll would only triple the load.
 */
export const shouldRetry = (failureCount: number, error: unknown): boolean =>
  failureCount < MAX_RETRIES && !hasHttpStatus(error) && isStreamHealthy();

/**
 * Polling is only a safety net for a broken stream: it is off while the stream delivers. The router
 * marks the live queries stale when the stream is lost, which re-arms this interval.
 */
export const pollingInterval = (): number | false => (isStreamHealthy() ? false : POLLING_INTERVAL_MS);

/**
 * A live query is kept fresh by the stream: while the stream is up, only an invalidation makes it
 * stale, so mounting it again or focusing the tab costs no request. Without the stream, data ages.
 */
export const staleTimeOf = (query: Query): number => (query.meta?.live && isStreamHealthy() ? Infinity : STALE_TIME_MS);

/**
 * Query functions call the API without their own error toast: background refetches (stream,
 * polling, focus) would repeat it. One toast per query is shown here, only when the query has no
 * data to show, and not again until it succeeds. A 404 is a state the page renders (deleted entity).
 */
const createErrorNotifier = () => {
  const notified = new WeakSet<object>();
  return new QueryCache({
    onError: (error, query) => {
      if (isNotFoundError(error) || query.state.data !== undefined || notified.has(query)) return;
      notified.add(query);
      notifyErrorHandler(error as unknown as ApiError);
    },
    onSuccess: (_data, query) => {
      notified.delete(query);
    },
  });
};

export const createAppQueryClient = (): QueryClient => new QueryClient({
  queryCache: createErrorNotifier(),
  defaultOptions: {
    queries: {
      staleTime: staleTimeOf,
      refetchOnWindowFocus: true,
      retry: shouldRetry,
      refetchInterval: pollingInterval,
    },
  },
});
