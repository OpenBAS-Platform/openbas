import { QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { type ReactNode, useEffect } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { keyOfTopic } from '../../../../../utils/query/keys';
import queryClient from '../../../../../utils/query/queryClient';

const SIMULATION_ID = 'simulation-1';
const mocks = vi.hoisted(() => ({
  fetchExerciseTeams: vi.fn(async () => null),
  fetchExerciseArticles: vi.fn(async () => null),
}));
let liveUpdates = false;

// The thunk is the promise itself: dispatch hands it back.
vi.mock('../../../../../utils/hooks', () => ({ useAppDispatch: () => (action: unknown) => action }));
vi.mock('../../../../../utils/hooks/useDataLoader', () => ({
  default: (loader: () => void) => {
    useEffect(() => {
      loader();
    }, []);
  },
}));
vi.mock('../../../../../utils/utils', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const original = await importOriginal<typeof import('../../../../../utils/utils')>();
  return {
    ...original,
    isFeatureEnabled: (feature: string) => feature === 'STREAM_INVALIDATION' && liveUpdates,
  };
});
vi.mock('../../../../../actions/Exercise', () => ({
  fetchExerciseTeams: mocks.fetchExerciseTeams,
  fetchExerciseInjectExpectations: vi.fn(),
}));
vi.mock('../../../../../actions/channels/article-action', () => ({ fetchExerciseArticles: mocks.fetchExerciseArticles }));

const { default: useSimulationStoreData, simulationStoreKey } = await import('../../../../../admin/components/simulations/simulation/simulationStoreQueries');

const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;

describe('useSimulationStoreData', () => {
  afterEach(() => {
    cleanup();
    queryClient.clear();
    vi.clearAllMocks();
  });

  describe('with live updates off', () => {
    beforeEach(() => {
      liveUpdates = false;
    });

    it('loads each dataset once, outside the query cache', async () => {
      // Act
      const { result } = renderHook(() => useSimulationStoreData(SIMULATION_ID, ['teams', 'articles']), { wrapper });

      // Assert
      await waitFor(() => expect(result.current.isPending).toBe(false));
      expect(mocks.fetchExerciseTeams).toHaveBeenCalledWith(SIMULATION_ID);
      expect(mocks.fetchExerciseArticles).toHaveBeenCalledWith(SIMULATION_ID);
      expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
    });
  });

  describe('with live updates on', () => {
    beforeEach(() => {
      liveUpdates = true;
    });

    it('keys each dataset under the simulation and reloads it when the simulation topic is invalidated', async () => {
      // Arrange
      const { result } = renderHook(() => useSimulationStoreData(SIMULATION_ID, ['teams', 'articles']), { wrapper });
      await waitFor(() => expect(result.current.isPending).toBe(false));
      expect(queryClient.getQueryData(simulationStoreKey(SIMULATION_ID, 'teams'))).toBeNull();

      // Act
      await act(() => queryClient.invalidateQueries({ queryKey: keyOfTopic(`simulation:${SIMULATION_ID}`) }));

      // Assert
      expect(mocks.fetchExerciseTeams).toHaveBeenCalledTimes(2);
      expect(mocks.fetchExerciseArticles).toHaveBeenCalledTimes(2);
    });

    it('shares one request between two components loading the same dataset', async () => {
      // Act
      const first = renderHook(() => useSimulationStoreData(SIMULATION_ID, ['teams']), { wrapper });
      const second = renderHook(() => useSimulationStoreData(SIMULATION_ID, ['teams']), { wrapper });

      // Assert
      await waitFor(() => expect(first.result.current.isPending || second.result.current.isPending).toBe(false));
      expect(mocks.fetchExerciseTeams).toHaveBeenCalledTimes(1);
    });
  });
});
