import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, render, waitFor } from '@testing-library/react';
import { type ReactNode, useEffect } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { simulationKey } from '../../../../../../utils/query/keys';

const SIMULATION_ID = 'simulation-1';

const fetchExpectationsMock = vi.fn((simulationId: string) => ({
  type: 'expectations',
  simulationId,
}));
const fetchInjectsMock = vi.fn((simulationId: string) => ({
  type: 'injects',
  simulationId,
}));
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
      exercise_status: 'FINISHED',
    },
    injectsMap: {},
    injectExpectations: [],
  }),
}));
vi.mock('../../../../../../actions/Exercise', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const original = await importOriginal<typeof import('../../../../../../actions/Exercise')>();
  return {
    ...original,
    fetchExerciseInjectExpectations: fetchExpectationsMock,
  };
});
vi.mock('../../../../../../actions/Inject', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const original = await importOriginal<typeof import('../../../../../../actions/Inject')>();
  return {
    ...original,
    fetchExerciseInjects: fetchInjectsMock,
  };
});
vi.mock('../../../../../../components/i18n', () => ({
  useFormatter: () => ({
    t: (s: string) => s,
    fndt: (s: string) => s,
  }),
}));
vi.mock('../../../../../../components/SearchFilter', () => ({ default: () => null }));
vi.mock('../../../../../../components/Empty', () => ({ default: () => null }));
vi.mock('../../../../../../components/common/detail/EntityDetailCommon', () => ({ SectionBlock: ({ children }: { children: ReactNode }) => <div>{children}</div> }));
vi.mock('../../../../../../admin/components/common/filters/TagsFilter', () => ({ default: () => null }));
vi.mock('../../../../../../admin/components/simulations/simulation/ExecutionMenu', () => ({ default: () => null }));

// Imported after the mocks so the screen picks them up.
const { default: Validations } = await import('../../../../../../admin/components/simulations/simulation/validation/Validations');

let queryClient: QueryClient;

const renderValidations = () => render(
  <QueryClientProvider client={queryClient}>
    <Validations />
  </QueryClientProvider>,
);

describe('Validations', () => {
  beforeEach(() => {
    queryClient = new QueryClient();
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

    it('reloads the expectations and injects on each invalidation of the simulation', async () => {
      // Arrange
      renderValidations();
      await waitFor(() => expect(fetchExpectationsMock).toHaveBeenCalledTimes(1));
      expect(fetchInjectsMock).toHaveBeenCalledTimes(1);
      expect(queryClient.getQueryCache().find({ queryKey: [...simulationKey(SIMULATION_ID), 'expectations'] })).toBeDefined();

      // Act
      await act(() => queryClient.invalidateQueries({ queryKey: simulationKey(SIMULATION_ID) }));

      // Assert
      await waitFor(() => expect(fetchExpectationsMock).toHaveBeenCalledTimes(2));
      expect(fetchInjectsMock).toHaveBeenCalledTimes(2);
      expect(fetchExpectationsMock).toHaveBeenLastCalledWith(SIMULATION_ID);
    });
  });

  describe('with live updates off', () => {
    beforeEach(() => {
      liveUpdates = false;
    });

    it('loads the data through the data loader, without queries', async () => {
      // Act
      renderValidations();
      await act(() => queryClient.invalidateQueries({ queryKey: simulationKey(SIMULATION_ID) }));

      // Assert
      expect(fetchExpectationsMock).toHaveBeenCalledTimes(1);
      expect(fetchInjectsMock).toHaveBeenCalledTimes(1);
      expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
    });
  });
});
