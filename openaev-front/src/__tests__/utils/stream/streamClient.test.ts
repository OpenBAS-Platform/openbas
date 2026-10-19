import { QueryClient, QueryObserver } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SCENARIOS_LIST_KEY } from '../../../utils/query/keys';

vi.mock('../../../utils/Action', () => ({ buildUri: (uri: string) => `/api/tenants/tenant-1${uri.slice('/api'.length)}` }));

// Imported after the mock so the client builds its URL from it.
const { default: startStreamClient } = await import('../../../utils/stream/streamClient');

class FakeWebSocket extends EventTarget {
  static instances: FakeWebSocket[] = [];

  readonly url: string;

  readyState = 0;

  binaryType = 'blob';

  sent: unknown[] = [];

  constructor(url: string) {
    super();
    this.url = url;
    FakeWebSocket.instances.push(this);
  }

  send(data: string) {
    this.sent.push(JSON.parse(data));
  }

  close() {
    this.readyState = 3;
  }

  open() {
    this.readyState = 1;
    this.dispatchEvent(new Event('open'));
  }

  receive(message: object) {
    this.dispatchEvent(new MessageEvent('message', { data: JSON.stringify(message) }));
  }

  serverClose(code: number) {
    this.readyState = 3;
    this.dispatchEvent(Object.assign(new Event('close'), {
      code,
      reason: '',
    }));
  }
}

const latestSocket = () => FakeWebSocket.instances[FakeWebSocket.instances.length - 1];

// Lets the reconnecting socket run its connection steps: a timer, then a chain of promises. A
// zero-delay timer created while timers run is due 1 ms later, and the last advance lets the
// promises after it settle.
const flush = async (ms = 0) => {
  await vi.advanceTimersByTimeAsync(ms);
  await vi.advanceTimersByTimeAsync(1);
  await vi.advanceTimersByTimeAsync(0);
};

const connect = async () => {
  await flush();
  const socket = latestSocket();
  socket.open();
  socket.receive({
    type: 'ready',
    protocol: 1,
  });
  return socket;
};

const SCENARIOS_TOPIC = 'list:scenarios';
// Math.random is pinned to 1 below, so each tab's first reconnection delay is its 5 s maximum.
const FIRST_RECONNECTION_DELAY_MS = 5_000;

describe('streamClient', () => {
  let queryClient: QueryClient;
  let stop: () => void;
  const unsubscribers: (() => void)[] = [];

  const mountQuery = (queryKey: unknown[], queryFn = vi.fn(async () => 'rows')) => {
    const observer = new QueryObserver(queryClient, {
      queryKey,
      queryFn,
    });
    const unsubscribe = observer.subscribe(() => {});
    unsubscribers.push(unsubscribe);
    return {
      queryFn,
      unsubscribe,
    };
  };

  beforeEach(() => {
    vi.useFakeTimers();
    FakeWebSocket.instances = [];
    vi.stubGlobal('WebSocket', FakeWebSocket);
    vi.spyOn(Math, 'random').mockReturnValue(1);
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    stop = startStreamClient(queryClient);
  });

  afterEach(() => {
    stop();
    unsubscribers.splice(0).forEach(unsubscribe => unsubscribe());
    queryClient.clear();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('opens the tenant socket on a ws URL', async () => {
    // Act
    await flush();

    // Assert
    expect(FakeWebSocket.instances).toHaveLength(1);
    expect(latestSocket().url).toMatch(/^wss?:\/\/[^/]+\/api\/tenants\/tenant-1\/ws$/);
  });

  describe('subscriptions', () => {
    it('sends nothing while no list is mounted', async () => {
      // Arrange
      const socket = await connect();

      // Act
      mountQuery(['detail', 'scenario', 'id-1']);
      await flush(1_000);

      // Assert
      expect(socket.sent).toEqual([]);
    });

    it('sends the topic set after ready', async () => {
      // Arrange
      mountQuery([...SCENARIOS_LIST_KEY, { page: 0 }]);
      await flush(1_000);

      // Act
      const socket = await connect();

      // Assert
      expect(socket.sent).toEqual([{
        type: 'subscribe',
        topics: [SCENARIOS_TOPIC],
      }]);
    });

    it('sends the new set on each change, once per change', async () => {
      // Arrange
      const socket = await connect();

      // Act: a list mounts, moves to another page (same topic), then unmounts
      const firstPage = mountQuery([...SCENARIOS_LIST_KEY, { page: 0 }]);
      await flush(1_000);
      firstPage.unsubscribe();
      const secondPage = mountQuery([...SCENARIOS_LIST_KEY, { page: 1 }]);
      await flush(1_000);
      secondPage.unsubscribe();
      await flush(1_000);

      // Assert
      expect(socket.sent).toEqual([
        {
          type: 'subscribe',
          topics: [SCENARIOS_TOPIC],
        },
        {
          type: 'subscribe',
          topics: [],
        },
      ]);
    });
  });

  describe('invalidations', () => {
    it('refetches only the queries of the invalidated topic', async () => {
      // Arrange
      const scenarios = mountQuery([...SCENARIOS_LIST_KEY, { page: 0 }]);
      const other = mountQuery(['list', 'simulations', { page: 0 }]);
      const socket = await connect();
      await flush(1_000);
      socket.receive({
        type: 'subscribed',
        granted: [SCENARIOS_TOPIC],
        denied: [],
      });
      await flush();
      scenarios.queryFn.mockClear();
      other.queryFn.mockClear();

      // Act
      socket.receive({
        type: 'invalidate',
        topic: SCENARIOS_TOPIC,
      });
      await flush();

      // Assert
      expect(scenarios.queryFn).toHaveBeenCalledTimes(1);
      expect(other.queryFn).not.toHaveBeenCalled();
    });

    it('reads once more the data loaded before its topic was granted, and only that', async () => {
      // Arrange: the list loads before the socket is ready, as on a full page load.
      const scenarios = mountQuery([...SCENARIOS_LIST_KEY, { page: 0 }]);
      await flush();
      const socket = await connect();
      await flush(1_000);

      // Act
      socket.receive({
        type: 'subscribed',
        granted: [SCENARIOS_TOPIC],
        denied: [],
      });
      await flush();
      socket.receive({
        type: 'subscribed',
        granted: [SCENARIOS_TOPIC],
        denied: [],
      });
      await flush();

      // Assert: one more read at the first grant, none when the grant is only repeated.
      expect(scenarios.queryFn).toHaveBeenCalledTimes(2);
    });

    it('fetches again when the topic is invalidated during a first fetch', async () => {
      // Arrange: the first answer is slow and was read before the change.
      let answerFirstFetch: (rows: string) => void = () => {};
      const queryFn = vi.fn()
        .mockImplementationOnce(() => new Promise<string>((resolve) => {
          answerFirstFetch = resolve;
        }))
        .mockResolvedValue('changed rows');
      mountQuery([...SCENARIOS_LIST_KEY, { page: 0 }], queryFn);
      const socket = await connect();
      await flush(1_000);
      socket.receive({
        type: 'subscribed',
        granted: [SCENARIOS_TOPIC],
        denied: [],
      });

      // Act
      socket.receive({
        type: 'invalidate',
        topic: SCENARIOS_TOPIC,
      });
      await flush();
      answerFirstFetch('stale rows');
      await flush();

      // Assert
      expect(queryFn).toHaveBeenCalledTimes(2);
      expect(queryClient.getQueryData([...SCENARIOS_LIST_KEY, { page: 0 }])).toBe('changed rows');
    });

    it('ignores unknown message types and malformed messages', async () => {
      // Arrange
      const scenarios = mountQuery([...SCENARIOS_LIST_KEY, { page: 0 }]);
      const socket = await connect();

      // Act
      socket.receive({ type: 'something-new' });
      socket.dispatchEvent(new MessageEvent('message', { data: 'not json' }));
      await flush();

      // Assert
      expect(scenarios.queryFn).toHaveBeenCalledTimes(1);
    });

    it('stops acting on a topic once its subscription is revoked', async () => {
      // Arrange
      const scenarios = mountQuery([...SCENARIOS_LIST_KEY, { page: 0 }]);
      const socket = await connect();
      socket.receive({
        type: 'subscribed',
        granted: [SCENARIOS_TOPIC],
        denied: [],
      });
      await flush();
      scenarios.queryFn.mockClear();

      // Act
      socket.receive({
        type: 'subscription-revoked',
        topics: [SCENARIOS_TOPIC],
      });
      socket.receive({
        type: 'invalidate',
        topic: SCENARIOS_TOPIC,
      });
      await flush();

      // Assert
      expect(scenarios.queryFn).not.toHaveBeenCalled();
    });
  });

  describe('reconnection', () => {
    it('resubscribes and refetches the lists on screen once after a reconnect', async () => {
      // Arrange
      const scenarios = mountQuery([...SCENARIOS_LIST_KEY, { page: 0 }]);
      // A list query in the cache without an observer is only marked stale.
      queryClient.setQueryData([...SCENARIOS_LIST_KEY, { page: 5 }], 'cached');
      const first = await connect();
      await flush();

      // Act
      first.serverClose(1006);
      await flush(FIRST_RECONNECTION_DELAY_MS);
      const second = await connect();
      await flush();

      // Assert
      expect(FakeWebSocket.instances).toHaveLength(2);
      expect(second.sent).toEqual([{
        type: 'subscribe',
        topics: [SCENARIOS_TOPIC],
      }]);
      expect(scenarios.queryFn).toHaveBeenCalledTimes(2);
      expect(queryClient.getQueryState([...SCENARIOS_LIST_KEY, { page: 5 }])?.isInvalidated).toBe(true);
    });

    it('does not refetch on the first ready', async () => {
      // Arrange
      const scenarios = mountQuery([...SCENARIOS_LIST_KEY, { page: 0 }]);

      // Act
      await connect();
      await flush();

      // Assert
      expect(scenarios.queryFn).toHaveBeenCalledTimes(1);
    });

    it.each([1008, 1009, 4401, 4403])('does not reconnect after close code %i', async (code) => {
      // Arrange
      const socket = await connect();

      // Act
      socket.serverClose(code);
      await flush(120_000);

      // Assert
      expect(FakeWebSocket.instances).toHaveLength(1);
    });

    it.each([1001, 1006, 1011, 4500])('reconnects after close code %i', async (code) => {
      // Arrange
      const socket = await connect();

      // Act
      socket.serverClose(code);
      await flush(FIRST_RECONNECTION_DELAY_MS);

      // Assert
      expect(FakeWebSocket.instances).toHaveLength(2);
    });

    it('forces a reconnect after 60 s without any message', async () => {
      // Arrange
      await connect();

      // Act
      await flush(59_000);
      const beforeTimeout = FakeWebSocket.instances.length;
      await flush(1_000);

      // Assert
      expect(beforeTimeout).toBe(1);
      expect(FakeWebSocket.instances).toHaveLength(2);
    });

    it('keeps the connection while heartbeats arrive', async () => {
      // Arrange
      const socket = await connect();

      // Act
      for (let elapsed = 0; elapsed < 120_000; elapsed += 25_000) {
        // eslint-disable-next-line no-await-in-loop -- each heartbeat must land after the previous interval elapsed
        await flush(25_000);
        socket.receive({ type: 'heartbeat' });
      }

      // Assert
      expect(FakeWebSocket.instances).toHaveLength(1);
    });
  });

  it('closes the socket for good when stopped', async () => {
    // Arrange
    const socket = await connect();

    // Act
    stop();
    await flush(120_000);

    // Assert
    expect(socket.readyState).toBe(3);
    expect(FakeWebSocket.instances).toHaveLength(1);
  });
});
