import { QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { type InjectResultOverviewOutput } from '../../../../../utils/api-types';
import { keyOfTopic } from '../../../../../utils/query/keys';
import queryClient from '../../../../../utils/query/queryClient';

const fetchOverviewMock = vi.fn<(injectId: string, notifyError?: boolean) => Promise<{ data: InjectResultOverviewOutput }>>();
const notifyErrorHandlerMock = vi.fn();
let liveUpdates = false;

const INJECT_ID = 'inject-1';

const overview = (title: string) => ({
  inject_id: INJECT_ID,
  inject_title: title,
  inject_updated_at: title,
}) as InjectResultOverviewOutput;

vi.mock('../../../../../actions/atomic_testings/atomic-testing-actions', () => ({ fetchInjectResultOverviewOutput: fetchOverviewMock }));
vi.mock('../../../../../utils/error/errorHandlerUtil', () => ({ notifyErrorHandler: notifyErrorHandlerMock }));
vi.mock('../../../../../utils/utils', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const original = await importOriginal<typeof import('../../../../../utils/utils')>();
  return {
    ...original,
    isFeatureEnabled: (feature: string) => feature === 'STREAM_INVALIDATION' && liveUpdates,
  };
});
vi.mock('../../../../../components/i18n', () => ({ useFormatter: () => ({ t: (s: string) => s }) }));
vi.mock('../../../../../components/Loader', () => ({ default: () => <div role="progressbar" /> }));
vi.mock('../../../../../admin/components/atomic_testings/atomic_testing/AtomicTestingRoutes', () => ({ default: () => null }));
vi.mock('../../../../../admin/components/atomic_testings/atomic_testing/context/TeamContextForAtomicTesting', () => ({ default: () => ({}) }));
vi.mock('../../../../../admin/components/atomic_testings/atomic_testing/AtomicTestingHeader', () => ({
  default: ({ injectResultOverview, setInjectResultOverview }: {
    injectResultOverview: InjectResultOverviewOutput;
    setInjectResultOverview: (overview: InjectResultOverviewOutput) => void;
  }) => (
    <>
      <h1>{injectResultOverview.inject_title}</h1>
      <button type="button" aria-label="launch" onClick={() => setInjectResultOverview(overview('Launched'))} />
    </>
  ),
}));

// Imported after the mocks so the screen picks them up.
const { default: Index } = await import('../../../../../admin/components/atomic_testings/atomic_testing/Index');

const renderIndex = () => render(
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={[`/admin/atomic_testings/${INJECT_ID}`]}>
      <Routes>
        <Route path="/admin/atomic_testings/:injectId/*" element={<Index />} />
      </Routes>
    </MemoryRouter>
  </QueryClientProvider>,
);

const UNAVAILABLE = 'Atomic testing is currently unavailable or you do not have sufficient permissions to access it.';

describe('atomic testing Index', () => {
  afterEach(() => {
    cleanup();
    queryClient.clear();
    vi.clearAllMocks();
  });

  describe('with live updates off', () => {
    beforeEach(() => {
      liveUpdates = false;
    });

    it('loads the overview outside the query cache', async () => {
      // Arrange
      fetchOverviewMock.mockResolvedValue({ data: overview('First') });

      // Act
      renderIndex();

      // Assert
      expect(await screen.findByRole('heading', { name: 'First' })).toBeDefined();
      expect(fetchOverviewMock).toHaveBeenCalledWith(INJECT_ID);
      expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
    });
  });

  describe('with live updates on', () => {
    beforeEach(() => {
      liveUpdates = true;
    });

    it('refetches the overview when its topic is invalidated', async () => {
      // Arrange
      fetchOverviewMock
        .mockResolvedValueOnce({ data: overview('First') })
        .mockResolvedValueOnce({ data: overview('Second') });
      renderIndex();
      expect(await screen.findByRole('heading', { name: 'First' })).toBeDefined();

      // Act
      await act(() => queryClient.invalidateQueries({ queryKey: keyOfTopic(`atomic-testing:${INJECT_ID}`) }));

      // Assert
      expect(await screen.findByRole('heading', { name: 'Second' })).toBeDefined();
      expect(fetchOverviewMock).toHaveBeenCalledTimes(2);
      // Errors are notified once by the screen, not by each attempt.
      expect(fetchOverviewMock).toHaveBeenCalledWith(INJECT_ID, false);
    });

    it('writes the overview an action returns into the cache without refetching it', async () => {
      // Arrange
      fetchOverviewMock.mockResolvedValue({ data: overview('First') });
      renderIndex();
      expect(await screen.findByRole('heading', { name: 'First' })).toBeDefined();

      // Act
      fireEvent.click(screen.getByRole('button', { name: 'launch' }));

      // Assert
      expect(await screen.findByRole('heading', { name: 'Launched' })).toBeDefined();
      expect(fetchOverviewMock).toHaveBeenCalledTimes(1);
    });

    it('shows the unavailable warning on a 404, without retrying and with one toast', async () => {
      // Arrange
      fetchOverviewMock.mockRejectedValue({
        status: 404,
        message: 'Not found',
      });

      // Act
      renderIndex();

      // Assert
      expect(await screen.findByText(UNAVAILABLE)).toBeDefined();
      expect(fetchOverviewMock).toHaveBeenCalledTimes(1);
      expect(notifyErrorHandlerMock).toHaveBeenCalledTimes(1);
    });

    it('replaces the overview with the warning when it disappears while on screen', async () => {
      // Arrange
      fetchOverviewMock
        .mockResolvedValueOnce({ data: overview('First') })
        .mockRejectedValueOnce({
          status: 404,
          message: 'Not found',
        });
      renderIndex();
      expect(await screen.findByRole('heading', { name: 'First' })).toBeDefined();

      // Act
      await act(() => queryClient.invalidateQueries({ queryKey: keyOfTopic(`atomic-testing:${INJECT_ID}`) }));

      // Assert
      expect(await screen.findByText(UNAVAILABLE)).toBeDefined();
      expect(notifyErrorHandlerMock).toHaveBeenCalledTimes(1);
    });
  });
});
