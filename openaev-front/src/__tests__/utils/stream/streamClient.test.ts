import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DATA_DELETE_SUCCESS, DATA_FETCH_SUCCESS, DATA_UPDATE_SUCCESS } from '../../../constants/ActionTypes';
import { type EntityChange } from '../../../utils/stream/entityChange';
import type * as StreamClientModule from '../../../utils/stream/streamClient';
import FakeEventSource from './fakeEventSource';

vi.mock('../../../utils/Action', () => ({
  buildUri: (path: string) => path,
  simpleCall: vi.fn(),
}));

type StreamClient = typeof StreamClientModule;

const message = (overrides: Record<string, unknown> = {}) => ({
  event_type: DATA_UPDATE_SUCCESS,
  attribute_id: 'tag_id',
  attribute_schema: 'tags',
  instance: {
    tag_id: 't1',
    tag_name: 'secret',
  },
  listened: true,
  ...overrides,
});

const bulkOperation = (overrides: Record<string, unknown> = {}) => ({
  bulk_operation_id: 'b1',
  bulk_operation_action: 'DELETE',
  bulk_operation_entity: 'injects',
  bulk_operation_total: 10,
  bulk_operation_processed: 10,
  bulk_operation_status: 'COMPLETED',
  bulk_operation_started_at: '2026-01-01T00:00:00Z',
  ...overrides,
});

describe('streamClient', () => {
  let client: StreamClient;

  beforeEach(async () => {
    vi.useFakeTimers();
    FakeEventSource.reset();
    vi.stubGlobal('EventSource', FakeEventSource);
    // No jitter: the reconnection delays below are the nominal ones.
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    vi.resetModules();
    client = await import('../../../utils/stream/streamClient');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    client.stopStream();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  describe('lifecycle', () => {
    it('opens a single connection however many times it is started', () => {
      client.startStream();
      client.startStream();
      expect(FakeEventSource.instances).toHaveLength(1);
      expect(FakeEventSource.last.url).toBe('/api/stream');
    });

    it('closes the connection on stop, and stop is idempotent', () => {
      client.startStream();
      const source = FakeEventSource.last;
      client.stopStream();
      client.stopStream();
      expect(source.closed).toBe(true);
    });

    it('opens a new connection when started again after a stop', () => {
      client.startStream();
      client.stopStream();
      client.startStream();
      expect(FakeEventSource.instances).toHaveLength(2);
      expect(FakeEventSource.instances[0].closed).toBe(true);
      expect(FakeEventSource.instances[1].closed).toBe(false);
    });

    it('does not reconnect after a stop that followed an error', () => {
      client.startStream();
      FakeEventSource.last.onerror?.();
      client.stopStream();
      vi.advanceTimersByTime(60_000);
      expect(FakeEventSource.instances).toHaveLength(1);
    });

    it('does nothing where EventSource is unavailable', () => {
      vi.stubGlobal('EventSource', undefined);
      expect(() => client.startStream()).not.toThrow();
      expect(client.isStreamHealthy()).toBe(false);
    });
  });

  describe('reconnection', () => {
    it('reconnects after an error with the 2s delay when pings are recent', () => {
      client.startStream();
      FakeEventSource.last.onerror?.();
      expect(FakeEventSource.instances[0].closed).toBe(true);
      vi.advanceTimersByTime(1999);
      expect(FakeEventSource.instances).toHaveLength(1);
      vi.advanceTimersByTime(1);
      expect(FakeEventSource.instances).toHaveLength(2);
    });

    it('reconnects with the backoff when pings stop arriving while the tab is visible', () => {
      client.startStream();
      for (let i = 0; i < 4; i += 1) {
        vi.advanceTimersByTime(1500);
      }
      expect(FakeEventSource.instances[0].closed).toBe(true);
      expect(FakeEventSource.instances).toHaveLength(1);
      vi.advanceTimersByTime(2000);
      expect(FakeEventSource.instances).toHaveLength(2);
    });

    it('spreads reconnections over ±30% of the delay', () => {
      vi.mocked(Math.random).mockReturnValue(0);
      client.startStream();
      FakeEventSource.last.onerror?.();
      vi.advanceTimersByTime(1399);
      expect(FakeEventSource.instances).toHaveLength(1);
      vi.advanceTimersByTime(1);
      expect(FakeEventSource.instances).toHaveLength(2);
    });

    it('starts nothing where EventSource does not exist', () => {
      vi.unstubAllGlobals();
      vi.stubGlobal('EventSource', undefined);
      client.startStream();
      expect(client.isStreamStarted()).toBe(false);
    });

    it('stays connected while pings keep arriving', () => {
      client.startStream();
      for (let i = 0; i < 20; i += 1) {
        FakeEventSource.last.emit('ping');
        vi.advanceTimersByTime(1500);
      }
      expect(FakeEventSource.instances).toHaveLength(1);
    });

    it('reports an outage once, unhealthy until the next open', () => {
      const lost = vi.fn();
      client.onConnectionLost(lost);
      client.startStream();
      FakeEventSource.last.emit('open');
      FakeEventSource.last.onerror?.();
      expect(client.isStreamHealthy()).toBe(false);
      vi.advanceTimersByTime(2000);
      FakeEventSource.last.onerror?.();
      expect(lost).toHaveBeenCalledTimes(1);
      vi.advanceTimersByTime(2000);
      FakeEventSource.last.emit('open');
      expect(client.isStreamHealthy()).toBe(true);
      FakeEventSource.last.onerror?.();
      expect(lost).toHaveBeenCalledTimes(2);
    });

    it('backs off to 10s once the outage lasts over 30s', () => {
      client.startStream();
      FakeEventSource.last.emit('open');
      vi.setSystemTime(Date.now() + 31_000);
      FakeEventSource.last.onerror?.();
      vi.advanceTimersByTime(9999);
      expect(FakeEventSource.instances).toHaveLength(1);
      vi.advanceTimersByTime(1);
      expect(FakeEventSource.instances).toHaveLength(2);
    });

    it('reports health from the last ping', () => {
      client.startStream();
      expect(client.isStreamHealthy()).toBe(true);
      vi.advanceTimersByTime(5000);
      expect(client.isStreamHealthy()).toBe(false);
      FakeEventSource.last.emit('ping');
      expect(client.isStreamHealthy()).toBe(true);
    });
  });

  describe('onConnectionOpen', () => {
    it('flags only the first open of a session', () => {
      const opens: boolean[] = [];
      client.onConnectionOpen(({ first }) => opens.push(first));
      client.startStream();
      FakeEventSource.last.emit('open');
      FakeEventSource.last.onerror?.();
      vi.advanceTimersByTime(2000);
      FakeEventSource.last.emit('open');
      FakeEventSource.last.emit('open');
      expect(opens).toEqual([true, false, false]);
    });

    it('flags the first open again after a stop and start', () => {
      const opens: boolean[] = [];
      client.onConnectionOpen(({ first }) => opens.push(first));
      client.startStream();
      FakeEventSource.last.emit('open');
      client.stopStream();
      client.startStream();
      FakeEventSource.last.emit('open');
      expect(opens).toEqual([true, true]);
    });

    it('tells whether the stream opened since the last start', () => {
      client.startStream();
      expect(client.hasStreamOpened()).toBe(false);
      FakeEventSource.last.emit('open');
      expect(client.hasStreamOpened()).toBe(true);
      client.stopStream();
      expect(client.hasStreamOpened()).toBe(false);
    });
  });

  describe('onEntityChange', () => {
    const collect = () => {
      const changes: EntityChange[] = [];
      client.onEntityChange(change => changes.push(change));
      client.startStream();
      return changes;
    };

    it('maps the event type to an action', () => {
      const changes = collect();
      const source = FakeEventSource.last;
      source.emit('message', message({ event_type: DATA_FETCH_SUCCESS }));
      source.emit('message', message({ event_type: DATA_UPDATE_SUCCESS }));
      source.emit('message', message({ event_type: DATA_DELETE_SUCCESS }));
      source.emit('message', message({ event_type: 'SOMETHING_ELSE' }));
      expect(changes.map(change => change.action)).toEqual(['create', 'update', 'delete', 'update']);
      expect(changes[0]).toEqual({
        type: 'tags',
        id: 't1',
        action: 'create',
      });
    });

    it('resolves the asset root of an agent', () => {
      const changes = collect();
      FakeEventSource.last.emit('message', message({
        attribute_id: 'agent_id',
        attribute_schema: 'agents',
        instance: {
          agent_id: 'a1',
          agent_asset: 'asset1',
        },
      }));
      expect(changes).toEqual([{
        type: 'agents',
        id: 'a1',
        action: 'update',
        root: {
          type: 'assets',
          id: 'asset1',
        },
      }]);
    });

    it('leaves the root out when the schema has none or the agent has no asset', () => {
      const changes = collect();
      FakeEventSource.last.emit('message', message());
      FakeEventSource.last.emit('message', message({
        attribute_id: 'agent_id',
        attribute_schema: 'agents',
        instance: { agent_id: 'a1' },
      }));
      expect(changes.every(change => !('root' in change))).toBe(true);
    });

    it('never exposes the instance', () => {
      const changes = collect();
      FakeEventSource.last.emit('message', message({
        attribute_id: 'agent_id',
        attribute_schema: 'agents',
        instance: {
          agent_id: 'a1',
          agent_asset: 'asset1',
          agent_secret: 'secret',
        },
      }));
      FakeEventSource.last.emit('message', message());
      expect(JSON.stringify(changes)).not.toContain('secret');
      changes.forEach(change => expect(Object.keys(change).sort()).not.toContain('instance'));
    });

    it('skips events that are not listened, malformed or unparsable', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const changes = collect();
      const source = FakeEventSource.last;
      source.emit('message', message({ listened: false }));
      source.emit('message', message({ attribute_schema: undefined }));
      source.emit('message', message({ attribute_id: undefined }));
      source.emit('message', message({ instance: {} }));
      source.emitRaw('message', 'not json');
      expect(changes).toEqual([]);
      source.emit('message', message());
      expect(changes).toHaveLength(1);
      warn.mockRestore();
    });

    it('keeps its subscription across stop and start', () => {
      const changes = collect();
      client.stopStream();
      client.startStream();
      FakeEventSource.last.emit('message', message());
      expect(changes).toHaveLength(1);
    });

    it('stops delivering once unsubscribed', () => {
      const handler = vi.fn();
      const unsubscribe = client.onEntityChange(handler);
      client.startStream();
      unsubscribe();
      FakeEventSource.last.emit('message', message());
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('onStreamMessage', () => {
    it('delivers the raw payload of listened events, instance included', () => {
      const handler = vi.fn();
      client.onStreamMessage(handler);
      client.startStream();
      FakeEventSource.last.emit('message', message());
      FakeEventSource.last.emit('message', message({ listened: false }));
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler.mock.calls[0][0].instance).toEqual({
        tag_id: 't1',
        tag_name: 'secret',
      });
    });
  });

  describe('onBulkOperationEnd', () => {
    it('emits the entity once when an operation reaches a terminal state', () => {
      const handler = vi.fn();
      client.onBulkOperationEnd(handler);
      client.startStream();
      FakeEventSource.last.emit('bulk-operation', bulkOperation({
        bulk_operation_status: 'RUNNING',
        bulk_operation_processed: 3,
      }));
      expect(handler).not.toHaveBeenCalled();
      FakeEventSource.last.emit('bulk-operation', bulkOperation());
      FakeEventSource.last.emit('bulk-operation', bulkOperation());
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith('injects');
    });

    it('ignores malformed payloads', () => {
      const handler = vi.fn();
      client.onBulkOperationEnd(handler);
      client.startStream();
      FakeEventSource.last.emitRaw('bulk-operation', 'not json');
      FakeEventSource.last.emit('bulk-operation', { bulk_operation_status: 'COMPLETED' });
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('subscribeStreamEvent', () => {
    it('attaches one dispatcher per type and re-attaches it on every reconnection', () => {
      const first = vi.fn();
      const second = vi.fn();
      client.subscribeStreamEvent('attack-path-version', first);
      client.startStream();
      client.subscribeStreamEvent('attack-path-version', second);
      expect(FakeEventSource.last.listenerCount('attack-path-version')).toBe(1);
      FakeEventSource.last.emit('attack-path-version', { v: 1 });
      expect(first).toHaveBeenCalledTimes(1);
      expect(second).toHaveBeenCalledTimes(1);

      FakeEventSource.last.onerror?.();
      vi.advanceTimersByTime(2000);
      expect(FakeEventSource.instances).toHaveLength(2);
      FakeEventSource.last.emit('attack-path-version', { v: 2 });
      expect(first).toHaveBeenCalledTimes(2);
    });

    it('stops delivering after unsubscribe', () => {
      const handler = vi.fn();
      client.startStream();
      const unsubscribe = client.subscribeStreamEvent('custom', handler);
      unsubscribe();
      FakeEventSource.last.emit('custom', {});
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('handler isolation', () => {
    it('keeps delivering to the other handlers when one throws', () => {
      const boom = () => {
        throw new Error('boom');
      };
      const messages = vi.fn();
      const changes = vi.fn();
      const bulk = vi.fn();
      const opens = vi.fn();
      const named = vi.fn();
      client.onStreamMessage(boom);
      client.onStreamMessage(messages);
      client.onEntityChange(boom);
      client.onEntityChange(changes);
      client.onBulkOperationEnd(boom);
      client.onBulkOperationEnd(bulk);
      client.onConnectionOpen(boom);
      client.onConnectionOpen(opens);
      client.subscribeStreamEvent('custom', boom);
      client.subscribeStreamEvent('custom', named);
      client.startStream();
      const source = FakeEventSource.last;
      expect(() => {
        source.emit('open');
        source.emit('message', message());
        source.emit('bulk-operation', bulkOperation());
        source.emit('custom', {});
      }).not.toThrow();
      expect(messages).toHaveBeenCalledTimes(1);
      expect(changes).toHaveBeenCalledTimes(1);
      expect(bulk).toHaveBeenCalledTimes(1);
      expect(opens).toHaveBeenCalledTimes(1);
      expect(named).toHaveBeenCalledTimes(1);
    });
  });
});
