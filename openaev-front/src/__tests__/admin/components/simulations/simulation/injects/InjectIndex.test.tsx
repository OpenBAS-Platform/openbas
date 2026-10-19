import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { useEffect } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { type InjectResultOverviewOutput } from '../../../../../../utils/api-types';
import { atomicTestingKey, simulationKey } from '../../../../../../utils/query/keys';

const SIMULATION_ID = 'simulation-1';
const INJECT_ID = 'inject-1';

const fetchExerciseMock = vi.fn((simulationId: string) => ({
  type: 'simulation',
  simulationId,
}));
const fetchOverviewMock = vi.fn<(injectId: string, notifyError?: boolean) => Promise<{ data: InjectResultOverviewOutput }>>();
const fetchTabMock = vi.fn(() => Promise.resolve('targets'));
let liveUpdates = false;

vi.mock('react-router', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const original = await importOriginal<typeof import('react-router')>();
  return {
    ...original,
    useParams: () => ({
      exerciseId: SIMULATION_ID,
      injectId: INJECT_ID,
    }),
  };
});
vi.mock('../../../../../../utils/utils', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const original = await importOriginal<typeof import('../../../../../../utils/utils')>();
  return {
    ...original,
    isFeatureEnabled: (feature: string) => feature === 'STREAM_INVALIDATION' && liveUpdates,
  };
});
// The fetch action is a thunk in the app: here the dispatch resolves at once.
vi.mock('../../../../../../utils/hooks', () => ({ useAppDispatch: () => (action: unknown) => Promise.resolve(action) }));
// Legacy loader: runs once on mount, as useDataLoader does outside of a stream reconnection.
vi.mock('../../../../../../utils/hooks/useDataLoader', () => ({
  default: (loader: () => void) => {
    useEffect(() => {
      loader();
    }, []);
  },
}));
vi.mock('../../../../../../store', () => ({ useHelper: () => ({ exercise_id: SIMULATION_ID }) }));
vi.mock('../../../../../../utils/permissions/useSimulationPermissions', () => ({ default: () => ({}) }));
vi.mock('../../../../../../actions/Exercise', () => ({ fetchExercise: fetchExerciseMock }));
vi.mock('../../../../../../actions/atomic_testings/atomic-testing-actions', () => ({ fetchInjectResultOverviewOutput: fetchOverviewMock }));
vi.mock('../../../../../../components/Loader', () => ({ default: () => 'loading' }));
vi.mock('../../../../../../components/NotFound', () => ({ default: () => 'not found' }));
vi.mock('../../../../../../admin/components/simulations/simulation/injects/InjectIndexHeader', () => ({ default: ({ injectResultOverview }: { injectResultOverview: InjectResultOverviewOutput }) => <div>{injectResultOverview.inject_title}</div> }));
// The tabs are the atomic testing ones: their queries start with the atomic testing key.
vi.mock('../../../../../../admin/components/atomic_testings/atomic_testing/AtomicTestingRoutes', () => ({
  default: () => {
    useQuery({
      queryKey: [...atomicTestingKey(INJECT_ID), 'targets'],
      queryFn: fetchTabMock,
      enabled: liveUpdates,
    });
    return null;
  },
}));

// Imported after the mocks so the screen picks them up.
const { default: InjectIndex } = await import('../../../../../../admin/components/simulations/simulation/injects/InjectIndex');

let queryClient: QueryClient;

const overview = (title: string) => ({
  data: {
    inject_id: INJECT_ID,
    inject_title: title,
  } as InjectResultOverviewOutput,
});

const renderInjectIndex = () => render(
  <QueryClientProvider client={queryClient}>
    <InjectIndex />
  </QueryClientProvider>,
);

describe('InjectIndex', () => {
  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  });

  afterEach(() => {
    cleanup();
    queryClient.clear();
    vi.clearAllMocks();
  });

  describe('with live updates on', () => {
    beforeEach(() => {
      liveUpdates = true;
    });

    it('loads the overview under the simulation key, with the error toast left to the query', async () => {
      // Arrange
      fetchOverviewMock.mockResolvedValue(overview('First'));

      // Act
      renderInjectIndex();

      // Assert
      expect(await screen.findByText('First')).toBeDefined();
      expect(fetchOverviewMock).toHaveBeenCalledWith(INJECT_ID, false);
      expect(queryClient.getQueryData([...simulationKey(SIMULATION_ID), 'inject', INJECT_ID, 'overview'])).toEqual(overview('First').data);
      expect(fetchExerciseMock).toHaveBeenCalledWith(SIMULATION_ID);
    });

    it('refetches the overview, the simulation and the inject tabs when the simulation key is invalidated', async () => {
      // Arrange
      fetchOverviewMock.mockResolvedValueOnce(overview('First')).mockResolvedValue(overview('Second'));
      renderInjectIndex();
      await screen.findByText('First');
      await waitFor(() => expect(fetchTabMock).toHaveBeenCalledTimes(1));

      // Act
      await act(() => queryClient.invalidateQueries({ queryKey: simulationKey(SIMULATION_ID) }));

      // Assert
      expect(await screen.findByText('Second')).toBeDefined();
      expect(fetchOverviewMock).toHaveBeenCalledTimes(2);
      expect(fetchExerciseMock).toHaveBeenCalledTimes(2);
      await waitFor(() => expect(fetchTabMock).toHaveBeenCalledTimes(2));
    });

    it('shows the not-found page when the inject is deleted or not accessible', async () => {
      // Arrange
      fetchOverviewMock.mockRejectedValue({ status: 404 });

      // Act
      renderInjectIndex();

      // Assert
      expect(await screen.findByText('not found')).toBeDefined();
    });
  });

  describe('with live updates off', () => {
    beforeEach(() => {
      liveUpdates = false;
    });

    it('loads the overview once, without any query', async () => {
      // Arrange
      fetchOverviewMock.mockResolvedValue(overview('First'));

      // Act
      renderInjectIndex();
      await screen.findByText('First');
      await act(() => queryClient.invalidateQueries({ queryKey: simulationKey(SIMULATION_ID) }));

      // Assert
      expect(fetchOverviewMock).toHaveBeenCalledTimes(1);
      expect(fetchOverviewMock).toHaveBeenCalledWith(INJECT_ID);
      expect(fetchExerciseMock).toHaveBeenCalledTimes(1);
      expect(queryClient.getQueryCache().getAll().filter(query => query.state.fetchStatus !== 'idle' || query.state.data !== undefined)).toHaveLength(0);
    });
  });
});
