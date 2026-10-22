import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DATA_UPDATE_SUCCESS } from '../../../constants/ActionTypes';
import type * as UseDataLoaderModule from '../../../utils/hooks/useDataLoader';
import type * as StreamClientModule from '../../../utils/stream/streamClient';
import FakeEventSource from './fakeEventSource';

const dispatch = vi.fn();

vi.mock('../../../store', () => ({ store: { dispatch: (action: unknown) => dispatch(action) } }));
vi.mock('../../../utils/Action', () => ({
  buildUri: (path: string) => path,
  simpleCall: vi.fn(),
}));

type StreamClient = typeof StreamClientModule;
type UseDataLoader = typeof UseDataLoaderModule;

const tagMessage = {
  event_type: DATA_UPDATE_SUCCESS,
  attribute_id: 'tag_id',
  attribute_schema: 'tags',
  instance: {
    tag_id: 't1',
    tag_name: 'name',
  },
  listened: true,
};

describe('stream shared by Redux and entity-change consumers', () => {
  let client: StreamClient;
  let useDataLoader: UseDataLoader['default'];

  beforeEach(async () => {
    vi.useFakeTimers();
    dispatch.mockReset();
    FakeEventSource.reset();
    vi.stubGlobal('EventSource', FakeEventSource);
    vi.resetModules();
    client = await import('../../../utils/stream/streamClient');
    useDataLoader = (await import('../../../utils/hooks/useDataLoader')).default;
  });

  afterEach(() => {
    client.stopStream();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('serves loaders and entity-change handlers from one EventSource', () => {
    const changes = vi.fn();
    client.onEntityChange(changes);
    const loader = vi.fn();
    renderHook(() => useDataLoader(loader, []));
    renderHook(() => useDataLoader(vi.fn(), []));
    client.startStream();

    expect(FakeEventSource.instances).toHaveLength(1);
    FakeEventSource.last.emit('message', tagMessage);
    vi.advanceTimersByTime(200);

    expect(changes).toHaveBeenCalledWith({
      type: 'tags',
      id: 't1',
      action: 'update',
    });
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch.mock.calls[0][0].type).toBe(DATA_UPDATE_SUCCESS);
  });

  it('feeds entity-change handlers with no loader mounted, without touching the store', () => {
    const changes = vi.fn();
    client.onEntityChange(changes);
    client.startStream();
    FakeEventSource.last.emit('message', tagMessage);
    vi.advanceTimersByTime(1000);
    expect(changes).toHaveBeenCalledTimes(1);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('keeps the stream open when the last loader unmounts', () => {
    client.startStream();
    const { unmount } = renderHook(() => useDataLoader(vi.fn(), []));
    const source = FakeEventSource.last;
    unmount();
    expect(source.closed).toBe(false);
    expect(FakeEventSource.instances).toHaveLength(1);
  });

  it('loads a mounting loader once, on the first open, not on mount', () => {
    client.startStream();
    const loader = vi.fn();
    renderHook(() => useDataLoader(loader, []));
    expect(loader).not.toHaveBeenCalled();
    FakeEventSource.last.emit('open');
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('loads a loader mounted after the stream opened immediately, and every loader on reconnection', () => {
    client.startStream();
    FakeEventSource.last.emit('open');
    const loader = vi.fn();
    renderHook(() => useDataLoader(loader, []));
    expect(loader).toHaveBeenCalledTimes(1);

    FakeEventSource.last.onerror?.();
    vi.advanceTimersByTime(2000);
    FakeEventSource.last.emit('open');
    expect(loader).toHaveBeenCalledTimes(2);
  });

  it('loads a loader at once outside a session, where no stream will reload it', () => {
    const loader = vi.fn();
    renderHook(() => useDataLoader(loader, []));
    expect(loader).toHaveBeenCalledTimes(1);
    expect(FakeEventSource.instances).toHaveLength(0);
  });

  it('reloads the mounted loaders once when a bulk operation ends', () => {
    client.startStream();
    const loader = vi.fn();
    renderHook(() => useDataLoader(loader, []));
    FakeEventSource.last.emit('open');
    loader.mockClear();
    FakeEventSource.last.emit('bulk-operation', {
      bulk_operation_id: 'b1',
      bulk_operation_action: 'DELETE',
      bulk_operation_entity: 'injects',
      bulk_operation_total: 1,
      bulk_operation_processed: 1,
      bulk_operation_status: 'COMPLETED',
      bulk_operation_started_at: '2026-01-01T00:00:00Z',
    });
    expect(loader).toHaveBeenCalledTimes(1);
  });
});
