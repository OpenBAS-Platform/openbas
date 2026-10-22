import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { AxiosError, type AxiosResponse } from 'axios';
import { type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { isNotFoundError, useApplyChanges, useLiveMutation } from '../../../utils/query/live';
import { type LiveRouter } from '../../../utils/query/liveRouter';
import { LiveRouterContext } from '../../../utils/query/liveRouterContext';
import { type EntityChange } from '../../../utils/stream/entityChange';

const axiosError = (status: number) => new AxiosError('failed', undefined, undefined, undefined, { status } as AxiosResponse);

const createRouter = (): LiveRouter => ({
  applyChanges: vi.fn(() => Promise.resolve()),
  invalidateType: vi.fn(),
  invalidateAllLive: vi.fn(),
  invalidateReadBefore: vi.fn(),
  markAllLiveStale: vi.fn(),
  dispose: vi.fn(),
});

const wrapperFor = (router: LiveRouter) => {
  const client = new QueryClient();
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <LiveRouterContext.Provider value={router}>{children}</LiveRouterContext.Provider>
    </QueryClientProvider>
  );
  return Wrapper;
};

describe('useApplyChanges', () => {
  it('given_aProvider_should_returnTheRouterApplyChanges', () => {
    // Arrange
    const router = createRouter();

    // Act
    const { result } = renderHook(() => useApplyChanges(), { wrapper: wrapperFor(router) });

    // Assert
    expect(result.current).toBe(router.applyChanges);
  });

  it('given_noProvider_should_throw', () => {
    // Arrange
    vi.spyOn(console, 'error').mockImplementation(() => {});

    // Act / Assert
    expect(() => renderHook(() => useApplyChanges())).toThrow('AppQueryProvider');
    vi.restoreAllMocks();
  });
});

describe('useLiveMutation', () => {
  it('given_aSuccess_should_applyChangesBeforeTheCallerOnSuccess', async () => {
    // Arrange
    const order: string[] = [];
    const router = createRouter();
    vi.mocked(router.applyChanges).mockImplementation(() => {
      order.push('applyChanges');
      return Promise.resolve();
    });
    const onSuccess = vi.fn(() => {
      order.push('onSuccess');
    });
    const changes = vi.fn((data: { id: string }, variables: string): EntityChange[] => [{
      type: 'assets',
      id: data.id,
      action: 'create',
    }, {
      type: 'tags',
      id: variables,
      action: 'update',
    }]);

    // Act
    const { result } = renderHook(
      () => useLiveMutation({
        mutationFn: (name: string) => Promise.resolve({ id: `id-${name}` }),
        changes,
        onSuccess,
      }),
      { wrapper: wrapperFor(router) },
    );
    result.current.mutate('x');

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(order).toEqual(['applyChanges', 'onSuccess']);
    expect(changes).toHaveBeenCalledWith({ id: 'id-x' }, 'x');
    expect(router.applyChanges).toHaveBeenCalledWith([
      {
        type: 'assets',
        id: 'id-x',
        action: 'create',
      },
      {
        type: 'tags',
        id: 'x',
        action: 'update',
      },
    ], { immediate: true });
    expect(onSuccess).toHaveBeenCalledWith({ id: 'id-x' }, 'x', undefined, expect.anything());
  });

  it('given_aFailure_should_notApplyChanges', async () => {
    // Arrange
    const router = createRouter();

    // Act
    const { result } = renderHook(
      () => useLiveMutation({
        mutationFn: () => Promise.reject(new Error('boom')),
        changes: () => [],
      }),
      { wrapper: wrapperFor(router) },
    );
    result.current.mutate();

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(router.applyChanges).not.toHaveBeenCalled();
  });

  it('given_noCallerOnSuccess_should_stillApplyChanges', async () => {
    // Arrange
    const router = createRouter();

    // Act
    const { result } = renderHook(
      () => useLiveMutation({
        mutationFn: () => Promise.resolve('ok'),
        changes: () => [{
          type: 'tags',
          id: '1',
          action: 'delete',
        }],
      }),
      { wrapper: wrapperFor(router) },
    );
    result.current.mutate();

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(router.applyChanges).toHaveBeenCalledTimes(1);
  });
});

describe('isNotFoundError', () => {
  it('given_anAxios404_should_returnTrue', () => {
    expect(isNotFoundError(axiosError(404))).toBe(true);
  });

  it.each([400, 403, 500])('given_anAxios%s_should_returnFalse', (status) => {
    expect(isNotFoundError(axiosError(status))).toBe(false);
  });

  it.each([new Error('x'), null, undefined, { response: { status: 404 } }])('given_aNonAxiosError_should_returnFalse', (error) => {
    expect(isNotFoundError(error)).toBe(false);
  });
});
