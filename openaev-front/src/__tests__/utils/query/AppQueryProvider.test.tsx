import { type QueryClient, useQueryClient } from '@tanstack/react-query';
import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import AppQueryProvider from '../../../utils/query/AppQueryProvider';
import { type EntityChange } from '../../../utils/stream/entityChange';

const stream = vi.hoisted(() => ({
  entityHandlers: new Set<(change: EntityChange) => void>(),
  bulkHandlers: new Set<(entity: string | undefined) => void>(),
  openHandlers: new Set<(info: {
    first: boolean;
    sessionStartedAt: number;
  }) => void>(),
  lostHandlers: new Set<() => void>(),
}));

vi.mock('../../../utils/stream/streamClient', () => {
  const subscribe = <T,>(handlers: Set<T>) => (handler: T) => {
    handlers.add(handler);
    return () => handlers.delete(handler);
  };
  return {
    onEntityChange: subscribe(stream.entityHandlers),
    onBulkOperationEnd: subscribe(stream.bulkHandlers),
    onConnectionOpen: subscribe(stream.openHandlers),
    onConnectionLost: subscribe(stream.lostHandlers),
    isStreamHealthy: () => true,
  };
});

vi.mock('@tanstack/react-query-devtools', () => ({ ReactQueryDevtools: () => null }));

let capturedClient: QueryClient;
const Probe = () => {
  capturedClient = useQueryClient();
  return null;
};

const mount = () => render(
  <AppQueryProvider>
    <Probe />
  </AppQueryProvider>,
);

const seed = async (key: string, live: { collections?: string[] }) => {
  await capturedClient.fetchQuery({
    queryKey: [key],
    queryFn: () => Promise.resolve([]),
    meta: { live },
  });
};

const isStale = (key: string) => capturedClient.getQueryState([key])?.isInvalidated === true;

describe('AppQueryProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    stream.entityHandlers.clear();
    stream.bulkHandlers.clear();
    stream.openHandlers.clear();
    stream.lostHandlers.clear();
  });

  it('given_aReconnection_should_invalidateEveryLiveQuery', async () => {
    // Arrange
    mount();
    await seed('list', { collections: ['assets'] });

    // Act
    act(() => stream.openHandlers.forEach(handler => handler({
      first: false,
      sessionStartedAt: 0,
    })));

    // Assert
    expect(isStale('list')).toBe(true);
  });

  it('given_theFirstOpen_should_invalidateOnlyDataReadBeforeTheStreamSession', async () => {
    // Arrange: one query read before the session started, one read with the page
    mount();
    await seed('old', { collections: ['assets'] });
    vi.setSystemTime(Date.now() + 1000);
    const sessionStartedAt = Date.now();
    vi.setSystemTime(sessionStartedAt + 1000);
    await seed('fresh', { collections: ['assets'] });

    // Act
    act(() => stream.openHandlers.forEach(handler => handler({
      first: true,
      sessionStartedAt,
    })));

    // Assert
    expect(isStale('old')).toBe(true);
    expect(isStale('fresh')).toBe(false);
  });

  it('given_aLostConnection_should_markEveryLiveQueryStale', async () => {
    // Arrange
    mount();
    await seed('list', { collections: ['assets'] });

    // Act
    act(() => stream.lostHandlers.forEach(handler => handler()));

    // Assert
    expect(isStale('list')).toBe(true);
  });

  it('given_anEntityChange_should_routeItToMatchingQueries', async () => {
    // Arrange
    mount();
    await seed('assets', { collections: ['assets'] });
    await seed('tags', { collections: ['tags'] });

    // Act
    stream.entityHandlers.forEach(handler => handler({
      type: 'assets',
      id: 'a1',
      action: 'create',
    }));
    await act(() => vi.advanceTimersByTimeAsync(250));

    // Assert
    expect(isStale('assets')).toBe(true);
    expect(isStale('tags')).toBe(false);
  });

  it('given_aBulkOperationOnKnownEntity_should_invalidateOnlyItsTypes', async () => {
    // Arrange
    mount();
    await seed('scenarios', { collections: ['scenarios'] });
    await seed('tags', { collections: ['tags'] });

    // Act
    act(() => stream.bulkHandlers.forEach(handler => handler('scenarios')));

    // Assert
    expect(isStale('scenarios')).toBe(true);
    expect(isStale('tags')).toBe(false);
  });

  it.each([undefined, 'something unmapped'])('given_aBulkOperationWithEntity_%s_should_invalidateEveryLiveQuery', async (entity) => {
    // Arrange
    mount();
    await seed('tags', { collections: ['tags'] });

    // Act
    act(() => stream.bulkHandlers.forEach(handler => handler(entity)));

    // Assert
    expect(isStale('tags')).toBe(true);
  });

  it('given_anUnmount_should_unsubscribeFromTheStream', () => {
    // Arrange
    const { unmount } = mount();
    expect(stream.entityHandlers.size).toBe(1);

    // Act
    unmount();

    // Assert
    expect(stream.entityHandlers.size).toBe(0);
    expect(stream.bulkHandlers.size).toBe(0);
    expect(stream.openHandlers.size).toBe(0);
  });

  it('given_aRemount_should_startWithAnEmptyCache', async () => {
    // Arrange
    const first = mount();
    await seed('list', { collections: ['assets'] });
    const firstClient = capturedClient;

    // Act
    first.unmount();
    mount();

    // Assert
    expect(capturedClient).not.toBe(firstClient);
    expect(capturedClient.getQueryCache().getAll()).toHaveLength(0);
  });
});
