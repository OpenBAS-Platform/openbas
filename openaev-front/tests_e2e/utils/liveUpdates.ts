import { type Page } from '@playwright/test';

// The backend under test runs with the preview features listed in this variable (CI passes the
// same list to the backend container), '*' turning on all of them.
export const liveUpdatesEnabled = (process.env.ENABLED_DEV_FEATURES ?? '')
  .split(',')
  .map(feature => feature.trim().toUpperCase())
  .some(feature => feature === '*' || feature === 'STREAM_INVALIDATION');

const STREAM_SOCKET_PATH = /\/api\/tenants\/[^/]+\/ws$/;
const DATA_STREAM_PATH = /\/api\/(tenants\/[^/]+\/)?stream$/;

// The server sends at most one invalidation per topic and tenant every 2 s, so a change waits up
// to that interval, then the browser refetches the queries of the topic.
export const LIVE_UPDATE_TIMEOUT = 5_000;

export interface StreamWatch {
  socketUrls: string[];
  // Topics of the last `subscribed` message.
  granted: string[];
  // Topics of every `invalidate` message received, in order.
  invalidated: string[];
}

/**
 * Records the invalidation sockets a page opens, the topics the server granted them and the
 * invalidations it sent. Call it before the page opens the socket.
 */
export const watchStream = (page: Page): StreamWatch => {
  const watch: StreamWatch = {
    socketUrls: [],
    granted: [],
    invalidated: [],
  };
  page.on('websocket', (socket) => {
    if (!STREAM_SOCKET_PATH.test(new URL(socket.url()).pathname)) {
      return;
    }
    watch.socketUrls.push(socket.url());
    socket.on('framereceived', ({ payload }) => {
      try {
        const message = JSON.parse(payload.toString());
        if (message.type === 'subscribed' && Array.isArray(message.granted)) {
          watch.granted = message.granted;
        } else if (message.type === 'invalidate' && typeof message.topic === 'string') {
          watch.invalidated.push(message.topic);
        }
      } catch {
        // not a JSON frame
      }
    });
  });
  return watch;
};

/**
 * Cuts the page off the SSE data stream, which runs beside the invalidation socket and also
 * updates some screens, so that a passing check proves the invalidation path alone.
 */
export const blockDataStream = async (page: Page) => {
  await page.route(url => DATA_STREAM_PATH.test(url.pathname), route => route.abort());
};
