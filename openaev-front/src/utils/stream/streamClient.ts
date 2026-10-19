import { type QueryClient } from '@tanstack/react-query';
import ReconnectingWebSocket from 'partysocket/ws';

import { buildUri } from '../Action';
import { keyOfTopic, topicOfKey } from '../query/keys';

// Close codes after which reconnecting cannot help: a malformed message or an exceeded limit,
// an oversized message, an ended session, a lost tenant membership.
const STOP_CLOSE_CODES = new Set([1008, 1009, 4401, 4403]);

// The server sends a heartbeat every 25 s: 60 s without any message means the connection is dead.
const SILENCE_TIMEOUT_MS = 60_000;

// Observers move between queries in remove-then-add pairs (page, filter or sort change, StrictMode
// double mount): waiting a moment sends one subscribe for the settled set instead of several.
const SUBSCRIBE_DELAY_MS = 100;

// Each tab draws its own first reconnection delay so that tabs spread out after a server restart.
const randomMinReconnectionDelay = () => 1_000 + Math.random() * 4_000;

interface StreamMessage {
  type?: unknown;
  topic?: unknown;
  topics?: unknown;
  granted?: unknown;
}

const streamUrl = () => {
  const url = new URL(buildUri('/api/ws'), window.location.href);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  return url.toString();
};

// Unknown types and fields are ignored so that a tab left open keeps working when the server
// learns new messages.
const parseMessage = (data: unknown): StreamMessage | null => {
  if (typeof data !== 'string') {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(data);
    return parsed !== null && typeof parsed === 'object' ? parsed as StreamMessage : null;
  } catch (_error) {
    return null;
  }
};

const stringList = (value: unknown): string[] => (Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []);

/**
 * Opens the tenant's invalidation socket and keeps the query cache in sync with it: subscribes to
 * the topics of the queries that have an observer, and invalidates the matching queries when the
 * server reports a change. Returns a function that closes the socket for good.
 */
const startStreamClient = (queryClient: QueryClient): (() => void) => {
  const queryCache = queryClient.getQueryCache();
  let ready = false;
  let wasReady = false;
  // Topics the server holds for this socket, as last sent; empty after each `ready`.
  let sentTopics = '';
  let grantedTopics = new Set<string>();
  // Queries whose first fetch was in flight when their topic was invalidated: the library merges
  // the refetch into that fetch, whose answer may predate the change, so they fetch again once it
  // settles.
  const refetchWhenSettled = new Set<string>();
  let subscribeTimer: ReturnType<typeof setTimeout> | undefined;
  let silenceTimer: ReturnType<typeof setTimeout> | undefined;

  const socket = new ReconnectingWebSocket(streamUrl(), undefined, {
    minReconnectionDelay: randomMinReconnectionDelay(),
    shouldReconnectOnClose: event => !STOP_CLOSE_CODES.has(event.code),
  });

  const observedTopics = (): string[] => {
    const topics = new Set<string>();
    queryCache.getAll().forEach((query) => {
      const topic = query.getObserversCount() > 0 ? topicOfKey(query.queryKey) : undefined;
      if (topic) {
        topics.add(topic);
      }
    });
    return [...topics].sort();
  };

  const sendSubscribe = () => {
    subscribeTimer = undefined;
    if (!ready) {
      return;
    }
    const topics = observedTopics();
    const serialized = topics.join(',');
    if (serialized === sentTopics) {
      return;
    }
    sentTopics = serialized;
    socket.send(JSON.stringify({
      type: 'subscribe',
      topics,
    }));
  };

  const scheduleSubscribe = () => {
    if (subscribeTimer === undefined) {
      subscribeTimer = setTimeout(sendSubscribe, SUBSCRIBE_DELAY_MS);
    }
  };

  const armSilenceTimer = () => {
    clearTimeout(silenceTimer);
    silenceTimer = setTimeout(() => socket.reconnect(), SILENCE_TIMEOUT_MS);
  };

  const onReady = () => {
    ready = true;
    sentTopics = '';
    grantedTopics = new Set();
    sendSubscribe();
    if (wasReady) {
      // Changes made while the socket was down were never announced: refetch the lists on screen once.
      queryClient.invalidateQueries({ predicate: query => topicOfKey(query.queryKey) !== undefined });
    }
    wasReady = true;
  };

  const onMessage = (event: MessageEvent) => {
    armSilenceTimer();
    const message = parseMessage(event.data);
    switch (message?.type) {
      case 'ready':
        onReady();
        break;
      case 'subscribed': {
        const previouslyGranted = grantedTopics;
        grantedTopics = new Set(stringList(message.granted));
        // Data already on screen for a newly granted topic was read before this socket listened
        // (typically on a full page load, where the socket is ready after the first fetches): a
        // change in between was never announced, so read it once more.
        grantedTopics.forEach((topic) => {
          if (!previouslyGranted.has(topic)) {
            queryClient.invalidateQueries({
              queryKey: keyOfTopic(topic),
              predicate: query => query.state.data !== undefined,
            });
          }
        });
        break;
      }
      case 'invalidate':
        if (typeof message.topic === 'string' && grantedTopics.has(message.topic)) {
          const queryKey = keyOfTopic(message.topic);
          queryCache.findAll({ queryKey }).forEach((query) => {
            if (query.state.fetchStatus === 'fetching' && query.state.data === undefined) {
              refetchWhenSettled.add(query.queryHash);
            }
          });
          queryClient.invalidateQueries({ queryKey });
        }
        break;
      case 'subscription-revoked':
        stringList(message.topics).forEach(topic => grantedTopics.delete(topic));
        break;
      default:
        // heartbeat, or a message type this client does not know
        break;
    }
  };

  const onOpen = () => armSilenceTimer();

  const onClose = () => {
    ready = false;
    clearTimeout(silenceTimer);
  };

  const unsubscribeCache = queryCache.subscribe((event) => {
    if (event.type === 'observerAdded' || event.type === 'observerRemoved') {
      scheduleSubscribe();
    } else if (event.type === 'updated' && (event.action.type === 'success' || event.action.type === 'error')
      && refetchWhenSettled.delete(event.query.queryHash)) {
      queryClient.invalidateQueries({
        queryKey: event.query.queryKey,
        exact: true,
      });
    } else if (event.type === 'removed') {
      refetchWhenSettled.delete(event.query.queryHash);
    }
  });
  socket.addEventListener('open', onOpen);
  socket.addEventListener('message', onMessage);
  socket.addEventListener('close', onClose);

  return () => {
    unsubscribeCache();
    clearTimeout(subscribeTimer);
    clearTimeout(silenceTimer);
    socket.removeEventListener('open', onOpen);
    socket.removeEventListener('message', onMessage);
    socket.removeEventListener('close', onClose);
    socket.close();
  };
};

export default startStreamClient;
