import { QueryClient, QueryClientProvider, type QueryKey } from '@tanstack/react-query';
import { act, cleanup, render, waitFor } from '@testing-library/react';
import { useEffect } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { simulationKey } from '../../../../../../utils/query/keys';

const SIMULATION_ID = 'simulation-1';

const fetchTeamsMock = vi.fn((simulationId: string) => ({
  type: 'teams',
  simulationId,
}));
const fetchVariablesMock = vi.fn((simulationId: string) => ({
  type: 'variables',
  simulationId,
}));
const fetchDocumentsMock = vi.fn((simulationId: string) => ({
  type: 'documents',
  simulationId,
}));
const injectsPropsMock = vi.fn<(props: { queryKey?: QueryKey }) => void>();
let liveUpdates = false;

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
// The fetch actions are thunks in the app: here the dispatch resolves at once.
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
    teams: [],
    articles: [],
    variables: [],
  }),
}));
vi.mock('../../../../../../components/i18n', () => ({ useFormatter: () => ({ t: (s: string) => s }) }));
vi.mock('../../../../../../actions/Exercise', () => ({ fetchExerciseTeams: fetchTeamsMock }));
vi.mock('../../../../../../actions/variables/variable-actions', () => ({ fetchVariablesForExercise: fetchVariablesMock }));
vi.mock('../../../../../../actions/documents/documents-actions', () => ({ fetchExerciseDocuments: fetchDocumentsMock }));
vi.mock('../../../../../../actions/challenge-action', () => ({ fetchExerciseChallenges: vi.fn() }));
vi.mock('../../../../../../actions/inject_test/simulation-inject-test-actions', () => ({ testInject: vi.fn() }));
vi.mock('../../../../../../admin/components/common/injects/Injects', () => ({
  default: (props: { queryKey?: QueryKey }) => {
    injectsPropsMock(props);
    return null;
  },
}));

// Imported after the mocks so the screen picks them up.
const { default: ExerciseInjects } = await import('../../../../../../admin/components/simulations/simulation/injects/ExerciseInjects');

let queryClient: QueryClient;

const renderInjects = () => render(
  <QueryClientProvider client={queryClient}>
    <ExerciseInjects />
  </QueryClientProvider>,
);

const lastInjectsProps = () => injectsPropsMock.mock.calls[injectsPropsMock.mock.calls.length - 1][0];

const expectLoadedTimes = (times: number) => {
  expect(fetchTeamsMock).toHaveBeenCalledTimes(times);
  expect(fetchVariablesMock).toHaveBeenCalledTimes(times);
  expect(fetchDocumentsMock).toHaveBeenCalledTimes(times);
};

describe('ExerciseInjects', () => {
  beforeEach(() => {
    queryClient = new QueryClient();
    localStorage.removeItem('scenario_or_exercise_view_mode');
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

    it('lists the injects through a query under the simulation key', () => {
      // Act
      renderInjects();

      // Assert
      expect(lastInjectsProps().queryKey).toEqual([...simulationKey(SIMULATION_ID), 'injects', 'list']);
    });

    it('reloads the store datasets when the simulation key is invalidated', async () => {
      // Arrange
      renderInjects();
      await waitFor(() => expectLoadedTimes(1));
      expect(fetchTeamsMock).toHaveBeenCalledWith(SIMULATION_ID);

      // Act
      await act(() => queryClient.invalidateQueries({ queryKey: simulationKey(SIMULATION_ID) }));

      // Assert
      await waitFor(() => expectLoadedTimes(2));
    });

    it('ignores the invalidation of another simulation', async () => {
      // Arrange
      renderInjects();
      await waitFor(() => expectLoadedTimes(1));

      // Act
      await act(() => queryClient.invalidateQueries({ queryKey: simulationKey('simulation-2') }));

      // Assert
      expect(fetchTeamsMock).toHaveBeenCalledTimes(1);
      expectLoadedTimes(1);
    });
  });

  describe('with live updates off', () => {
    beforeEach(() => {
      liveUpdates = false;
    });

    it('loads the store datasets through the data loader, without a list query', async () => {
      // Act
      renderInjects();
      await act(() => queryClient.invalidateQueries({ queryKey: simulationKey(SIMULATION_ID) }));

      // Assert
      expect(lastInjectsProps().queryKey).toBeUndefined();
      expectLoadedTimes(1);
      expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
    });
  });
});
