import { createContext, useContext } from 'react';

import { type EntityChange } from '../stream/entityChange';
import { type LiveRouter } from './liveRouter';

export const LiveRouterContext = createContext<LiveRouter | null>(null);

export const useLiveRouter = (): LiveRouter => {
  const router = useContext(LiveRouterContext);
  if (!router) throw new Error('useLiveRouter must be used inside AppQueryProvider');
  return router;
};

// The router of the mounted session, for code outside React (legacy Redux thunks).
let sessionRouter: LiveRouter | null = null;

export const setSessionRouter = (router: LiveRouter | null) => {
  sessionRouter = router;
};

/**
 * Announces changes made outside a `useLiveMutation` (a legacy Redux thunk) so the queries showing
 * them refresh at once instead of waiting for the stream echo. A no-op outside a session.
 */
export const publishChanges = (changes: EntityChange[]) => {
  sessionRouter?.applyChanges(changes, { immediate: true });
};
