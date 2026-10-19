import { QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, render, screen } from '@testing-library/react';
import { useEffect, useSyncExternalStore } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { type SimulationDetails } from '../../../../../utils/api-types';
import { keyOfTopic } from '../../../../../utils/query/keys';
import queryClient from '../../../../../utils/query/queryClient';

const SIMULATION_ID = 'simulation-1';
const UNAVAILABLE = 'Simulation is currently unavailable or you do not have sufficient permissions to access it.';

// A minimal store: fetchExercise writes the simulation, useHelper reads it and re-renders on change.
let storedExercise: SimulationDetails | undefined;
const storeListeners = new Set<() => void>();
const setStoredExercise = (exercise: SimulationDetails | undefined) => {
  storedExercise = exercise;
  storeListeners.forEach(listener => listener());
};
const subscribe = (listener: () => void) => {
  storeListeners.add(listener);
  return () => storeListeners.delete(listener);
};

const simulation = (name: string, scenarioId?: string) => ({
  exercise_id: SIMULATION_ID,
  exercise_name: name,
  exercise_scenario: scenarioId,
}) as unknown as SimulationDetails;

const fetchExerciseMock = vi.fn<(exerciseId: string) => Promise<unknown>>();
const fetchScenarioFromSimulationMock = vi.fn<(exerciseId: string) => Promise<unknown>>(async () => null);
const loadExercise = (name: string, scenarioId?: string) => async () => {
  setStoredExercise(simulation(name, scenarioId));
  return simulation(name, scenarioId);
};
let liveUpdates = false;

vi.mock('../../../../../store', () => ({
  store: {},
  useHelper: (selector: (helper: { getExercise: () => SimulationDetails | undefined }) => unknown) => {
    const current = useSyncExternalStore(subscribe, () => storedExercise);
    return selector({ getExercise: () => current });
  },
}));
// The thunk is the promise itself: dispatch hands it back.
vi.mock('../../../../../utils/hooks', () => ({ useAppDispatch: () => (action: unknown) => action }));
vi.mock('../../../../../actions/Exercise', () => ({ fetchExercise: fetchExerciseMock }));
vi.mock('../../../../../actions/exercises/exercise-action', () => ({ fetchScenarioFromSimulation: fetchScenarioFromSimulationMock }));
vi.mock('../../../../../utils/hooks/useDataLoader', () => ({
  default: (loader: () => void, deps: unknown[] = []) => {
    useEffect(() => {
      loader();
    }, deps);
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
vi.mock('../../../../../components/i18n', () => ({ useFormatter: () => ({ t: (s: string) => s }) }));
vi.mock('../../../../../components/Loader', () => ({ default: () => <div role="progressbar" /> }));
// The shell renders the simulation name only: the routed tabs are out of scope here.
vi.mock('../../../../../admin/components/simulations/simulation/SimulationShell', () => ({ default: ({ exercise }: { exercise: SimulationDetails }) => <h1>{exercise.exercise_name}</h1> }));
vi.mock('../../../../../admin/components/simulations/simulation/ExerciseContext', () => ({ default: () => ({}) }));
vi.mock('../../../../../utils/permissions/useSimulationPermissions', () => ({ default: () => ({}) }));
vi.mock('../../../../../admin/components/autonomous/useAutonomousRunForSimulation', () => ({
  default: () => ({
    run: null,
    resolved: true,
    setRun: vi.fn(),
  }),
}));
vi.mock('../../../../../admin/components/autonomous/AutonomousReasoningPanel', () => ({ default: () => null }));
vi.mock('../../../../../admin/components/autonomous/AutonomousOverview', () => ({ default: () => null }));
vi.mock('../../../../../admin/components/autonomous/useAutonomousPanelWidth', () => ({ default: () => [400, vi.fn()] }));

// Imported after the mocks so the screen picks them up.
const { default: Index } = await import('../../../../../admin/components/simulations/simulation/Index');

const renderIndex = () => render(
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={[`/admin/simulations/${SIMULATION_ID}`]}>
      <Routes>
        <Route path="/admin/simulations/:exerciseId/*" element={<Index />} />
      </Routes>
    </MemoryRouter>
  </QueryClientProvider>,
);

const invalidateSimulationTopic = () => act(() => queryClient.invalidateQueries({ queryKey: keyOfTopic(`simulation:${SIMULATION_ID}`) }));

describe('simulation Index', () => {
  afterEach(() => {
    cleanup();
    queryClient.clear();
    setStoredExercise(undefined);
    vi.clearAllMocks();
  });

  describe('with live updates off', () => {
    beforeEach(() => {
      liveUpdates = false;
    });

    it('loads the simulation and its parent scenario outside the query cache', async () => {
      // Arrange
      fetchExerciseMock.mockImplementation(loadExercise('First', 'scenario-1'));

      // Act
      renderIndex();

      // Assert
      expect(await screen.findByRole('heading', { name: 'First' })).toBeDefined();
      expect(fetchExerciseMock).toHaveBeenCalledTimes(1);
      expect(fetchScenarioFromSimulationMock).toHaveBeenCalledTimes(1);
      // The queries stay registered but disabled: they never run.
      expect(queryClient.getQueryCache().getAll().every(query => query.state.dataUpdatedAt === 0 && query.state.fetchStatus === 'idle')).toBe(true);
    });
  });

  describe('with live updates on', () => {
    beforeEach(() => {
      liveUpdates = true;
    });

    it('refetches the simulation and its parent scenario when its topic is invalidated', async () => {
      // Arrange
      fetchExerciseMock
        .mockImplementationOnce(loadExercise('First', 'scenario-1'))
        .mockImplementationOnce(loadExercise('Second', 'scenario-1'));
      renderIndex();
      expect(await screen.findByRole('heading', { name: 'First' })).toBeDefined();

      // Act
      await invalidateSimulationTopic();

      // Assert
      expect(await screen.findByRole('heading', { name: 'Second' })).toBeDefined();
      expect(fetchExerciseMock).toHaveBeenCalledTimes(2);
      expect(fetchScenarioFromSimulationMock).toHaveBeenCalledTimes(2);
    });

    it('keeps the screen while a refetch runs', async () => {
      // Arrange
      let resolveRefetch: () => void = () => {};
      fetchExerciseMock
        .mockImplementationOnce(loadExercise('First'))
        .mockImplementationOnce(() => new Promise((resolve) => {
          resolveRefetch = () => resolve(null);
        }));
      renderIndex();
      expect(await screen.findByRole('heading', { name: 'First' })).toBeDefined();

      // Act
      act(() => {
        queryClient.invalidateQueries({ queryKey: keyOfTopic(`simulation:${SIMULATION_ID}`) });
      });

      // Assert
      expect(screen.queryByRole('progressbar')).toBeNull();
      expect(screen.getByRole('heading', { name: 'First' })).toBeDefined();
      await act(async () => resolveRefetch());
    });

    it('shows the unavailable warning on a 404, without retrying', async () => {
      // Arrange
      fetchExerciseMock.mockRejectedValue({
        status: 404,
        message: 'Not found',
      });

      // Act
      renderIndex();

      // Assert
      expect(await screen.findByText(UNAVAILABLE)).toBeDefined();
      expect(fetchExerciseMock).toHaveBeenCalledTimes(1);
    });

    it('replaces the simulation with the warning when it is deleted while on screen', async () => {
      // Arrange
      fetchExerciseMock
        .mockImplementationOnce(loadExercise('First'))
        .mockRejectedValueOnce({
          status: 404,
          message: 'Not found',
        });
      renderIndex();
      expect(await screen.findByRole('heading', { name: 'First' })).toBeDefined();

      // Act
      await invalidateSimulationTopic();

      // Assert: the store still holds the simulation, the query error alone shows the warning.
      expect(await screen.findByText(UNAVAILABLE)).toBeDefined();
      expect(storedExercise).toBeDefined();
    });
  });
});
