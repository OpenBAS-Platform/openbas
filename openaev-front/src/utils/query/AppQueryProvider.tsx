import { QueryClientProvider } from '@tanstack/react-query';
import { lazy, type ReactNode, Suspense, useEffect, useState } from 'react';

import { onBulkOperationEnd, onConnectionLost, onConnectionOpen, onEntityChange } from '../stream/streamClient';
import bulkEntityTypes from './bulkOperationEntities';
import { createLiveRouter } from './liveRouter';
import { LiveRouterContext, setSessionRouter } from './liveRouterContext';
import { createAppQueryClient } from './queryClient';

// Dev-only: the DEV guard removes this import from production builds.
const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() => import('@tanstack/react-query-devtools').then(module => ({ default: module.ReactQueryDevtools })))
  : null;

interface Props { children: ReactNode }

/**
 * One query cache per mount. `Root` mounts it only for a logged-in user, keyed by that user, so a
 * session that ends or changes drops the cache; a tenant switch reloads the page. It also routes the
 * stream's entity changes to the live queries.
 */
const AppQueryProvider = ({ children }: Props) => {
  const [queryClient] = useState(createAppQueryClient);
  const [router] = useState(() => createLiveRouter(queryClient));

  useEffect(() => {
    const unsubscribes = [
      onEntityChange(change => router.applyChanges([change])),
      onBulkOperationEnd(entity => router.invalidateType(bulkEntityTypes(entity))),
      // A reconnection may have missed changes. On the first open, only data read before the
      // stream session started can have missed some: the queries mounting with the page are fresh.
      onConnectionOpen(({ first, sessionStartedAt }) => (first
        ? router.invalidateReadBefore(sessionStartedAt)
        : router.invalidateAllLive())),
      // Marking stale without a request re-arms the fallback polling: while the platform is down,
      // fetching right away would only fail.
      onConnectionLost(() => router.markAllLiveStale()),
    ];
    setSessionRouter(router);
    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
      setSessionRouter(null);
      router.dispose();
    };
  }, [router]);

  return (
    <QueryClientProvider client={queryClient}>
      <LiveRouterContext.Provider value={router}>
        {children}
      </LiveRouterContext.Provider>
      {ReactQueryDevtools && (
        <Suspense fallback={null}>
          <ReactQueryDevtools initialIsOpen={false} />
        </Suspense>
      )}
    </QueryClientProvider>
  );
};

export default AppQueryProvider;
