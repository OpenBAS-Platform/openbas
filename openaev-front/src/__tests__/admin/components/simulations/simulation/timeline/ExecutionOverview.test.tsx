import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, render, waitFor } from '@testing-library/react';
import { type ReactNode, useEffect } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { simulationKey } from '../../../../../../utils/query/keys';
import { FALLBACK_REFETCH_INTERVAL_MS } from '../../../../../../utils/query/useNotifiedQuery';

const SIMULATION_ID = 'simulation-1';

const reconcileInjectsMock = vi.fn((simulationId: string) => ({
  type: 'reconcile-injects',
  simulationId,
}));
const fetchExpectationsMock = vi.fn((simulationId: string) => ({
  type: 'expectations',
  simulationId,
}));
let liveUpdates = false;
let exerciseStatus = 'SCHEDULED';

vi.mock('react-router', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const original = await importOriginal<typeof import('react-router')>();
  return {
    ...original,
    useParams: () => ({ exerciseId: SIMULATION_ID }),
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
// Fetch actions are thunks in the app: here the dispatch resolves at once.
vi.mock('../../../../../../utils/hooks', () => ({ useAppDispatch: () => (action: unknown) => Promise.resolve(action) }));
// Legacy loader: runs once on mount, as useDataLoader does outside of a stream reconnection.
vi.mock('../../../../../../utils/hooks/useDataLoader', () => ({
  default: (loader: () => void) => {
    useEffect(() => {
      loader();
    }, []);
  },
}));
vi.mock('../../../../../../store', () => ({
  useHelper: () => ({
    exercise: {
      exercise_id: SIMULATION_ID,
      exercise_status: exerciseStatus,
    },
    injects: [],
    teams: [],
    articles: [],
    variables: [],
    injectExpectations: [],
  }),
}));
vi.mock('../../../../../../actions/Inject', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const original = await importOriginal<typeof import('../../../../../../actions/Inject')>();
  return {
    ...original,
    reconcileExerciseInjects: reconcileInjectsMock,
  };
});
vi.mock('../../../../../../actions/Exercise', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const original = await importOriginal<typeof import('../../../../../../actions/Exercise')>();
  return {
    ...original,
    fetchExerciseInjectExpectations: fetchExpectationsMock,
  };
});
vi.mock('../../../../../../components/i18n', () => ({ useFormatter: () => ({ t: (s: string) => s }) }));
vi.mock('../../../../../../components/SearchFilter', () => ({ default: () => null }));
vi.mock('../../../../../../components/common/detail/EntityDetailCommon', () => ({ SectionBlock: ({ children }: { children: ReactNode }) => <div>{children}</div> }));
vi.mock('../../../../../../admin/components/common/filters/TagsFilter', () => ({ default: () => null }));
vi.mock('../../../../../../admin/components/common/injects/UpdateInject', () => ({ default: () => null }));
vi.mock('../../../../../../admin/components/workspaces/custom_dashboards/widgets/viz/sample/SamplePreview', () => ({ default: () => null }));
vi.mock('../../../../../../admin/components/simulations/simulation/ExecutionMenu', () => ({ default: () => null }));
vi.mock('../../../../../../admin/components/simulations/simulation/timeline/AttackTimeline', () => ({ default: () => null }));
vi.mock('../../../../../../admin/components/simulations/simulation/timeline/ExecutionBoard', () => ({ default: () => null }));
vi.mock('../../../../../../admin/components/simulations/simulation/timeline/ExecutionFlowStrip', () => ({ default: () => null }));
vi.mock('../../../../../../admin/components/simulations/simulation/timeline/ExecutionHero', () => ({ default: () => null }));

// Imported after the mocks so the screen picks them up.
const { default: ExecutionOverview } = await import('../../../../../../admin/components/simulations/simulation/timeline/ExecutionOverview');

let queryClient: QueryClient;

const renderTimeline = () => render(
  <QueryClientProvider client={queryClient}>
    <ExecutionOverview />
  </QueryClientProvider>,
);

const observedRefetchInterval = (dataset: string) => queryClient.getQueryCache()
  .find({ queryKey: [...simulationKey(SIMULATION_ID), dataset] })?.observers[0]?.options.refetchInterval;

describe('ExecutionOverview', () => {
  beforeEach(() => {
    queryClient = new QueryClient();
    exerciseStatus = 'SCHEDULED';
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

    it('reloads the injects and expectations on each invalidation of the simulation', async () => {
      // Arrange
      renderTimeline();
      await waitFor(() => expect(reconcileInjectsMock).toHaveBeenCalledTimes(1));
      expect(fetchExpectationsMock).toHaveBeenCalledTimes(1);

      // Act
      await act(() => queryClient.invalidateQueries({ queryKey: simulationKey(SIMULATION_ID) }));

      // Assert
      await waitFor(() => expect(reconcileInjectsMock).toHaveBeenCalledTimes(2));
      expect(fetchExpectationsMock).toHaveBeenCalledTimes(2);
      expect(reconcileInjectsMock).toHaveBeenLastCalledWith(SIMULATION_ID);
    });

    it('polls on the fallback interval only while the simulation runs', async () => {
      // Arrange
      exerciseStatus = 'RUNNING';

      // Act
      renderTimeline();
      await waitFor(() => expect(reconcileInjectsMock).toHaveBeenCalledTimes(1));

      // Assert
      expect(observedRefetchInterval('injects-reconciled')).toBe(FALLBACK_REFETCH_INTERVAL_MS);
      expect(observedRefetchInterval('expectations')).toBe(FALLBACK_REFETCH_INTERVAL_MS);
    });

    it('does not poll a simulation that is not running', async () => {
      // Act
      renderTimeline();
      await waitFor(() => expect(reconcileInjectsMock).toHaveBeenCalledTimes(1));

      // Assert
      expect(observedRefetchInterval('injects-reconciled')).toBe(false);
    });
  });

  describe('with live updates off', () => {
    beforeEach(() => {
      liveUpdates = false;
    });

    it('loads the data through the data loaders, without queries', async () => {
      // Act
      renderTimeline();
      await act(() => queryClient.invalidateQueries({ queryKey: simulationKey(SIMULATION_ID) }));

      // Assert
      expect(reconcileInjectsMock).toHaveBeenCalledTimes(1);
      expect(fetchExpectationsMock).toHaveBeenCalledTimes(1);
      expect(queryClient.getQueryCache().getAll().filter(query => query.state.dataUpdateCount > 0)).toHaveLength(0);
    });
  });
});
