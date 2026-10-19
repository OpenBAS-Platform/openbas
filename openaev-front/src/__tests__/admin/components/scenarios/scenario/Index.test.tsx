import { QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, render, screen } from '@testing-library/react';
import { useEffect, useSyncExternalStore } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { type ScenarioOutput } from '../../../../../utils/api-types';
import { keyOfTopic } from '../../../../../utils/query/keys';
import queryClient from '../../../../../utils/query/queryClient';

const SCENARIO_ID = 'scenario-1';
const UNAVAILABLE = 'Scenario is currently unavailable or you do not have sufficient permissions to access it.';

// A minimal store: fetchScenario writes the scenario, useHelper reads it and re-renders on change.
let storedScenario: ScenarioOutput | undefined;
const storeListeners = new Set<() => void>();
const setStoredScenario = (scenario: ScenarioOutput | undefined) => {
  storedScenario = scenario;
  storeListeners.forEach(listener => listener());
};
const subscribe = (listener: () => void) => {
  storeListeners.add(listener);
  return () => storeListeners.delete(listener);
};

const scenario = (name: string) => ({
  scenario_id: SCENARIO_ID,
  scenario_name: name,
}) as ScenarioOutput;

const fetchScenarioMock = vi.fn<(scenarioId: string) => Promise<unknown>>();
const loadScenario = (name: string) => async () => {
  setStoredScenario(scenario(name));
  return scenario(name);
};
let liveUpdates = false;

vi.mock('../../../../../store', () => ({
  store: {},
  useHelper: (selector: (helper: { getScenario: () => ScenarioOutput | undefined }) => unknown) => {
    const current = useSyncExternalStore(subscribe, () => storedScenario);
    return selector({ getScenario: () => current });
  },
}));
// The thunk is the promise itself: dispatch hands it back.
vi.mock('../../../../../utils/hooks', () => ({ useAppDispatch: () => (action: unknown) => action }));
vi.mock('../../../../../actions/scenarios/scenario-actions', () => ({ fetchScenario: fetchScenarioMock }));
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
vi.mock('../../../../../components/Breadcrumbs', () => ({ default: ({ elements }: { elements: { label: string }[] }) => <h1>{elements[1].label}</h1> }));
vi.mock('../../../../../admin/components/scenarios/scenario/ScenarioHeader', () => ({ default: () => null }));
vi.mock('../../../../../admin/components/scenarios/scenario/Scenario', () => ({ default: () => null }));
vi.mock('../../../../../admin/components/scenarios/scenario/ScenarioContext', () => ({ default: () => ({}) }));
vi.mock('../../../../../admin/components/injects/useHasInjectTests', () => ({ default: () => false }));
vi.mock('../../../../../utils/permissions/useScenarioPermissions', () => ({ default: () => ({}) }));
vi.mock('../../../../../admin/components/autonomous/useAutonomousRunForSimulation', () => ({
  useAutonomousRunForScenario: () => ({
    run: null,
    resolved: true,
    setRun: vi.fn(),
    clearRun: vi.fn(),
  }),
}));
vi.mock('../../../../../admin/components/autonomous/AutonomousReasoningPanel', () => ({ default: () => null }));
vi.mock('../../../../../admin/components/autonomous/useAutonomousPanelWidth', () => ({ default: () => [400, vi.fn()] }));

// Imported after the mocks so the screen picks them up.
const { default: Index } = await import('../../../../../admin/components/scenarios/scenario/Index');

const renderIndex = () => render(
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={[`/admin/scenarios/${SCENARIO_ID}`]}>
      <Routes>
        <Route path="/admin/scenarios/:scenarioId/*" element={<Index />} />
      </Routes>
    </MemoryRouter>
  </QueryClientProvider>,
);

describe('scenario Index', () => {
  afterEach(() => {
    cleanup();
    queryClient.clear();
    setStoredScenario(undefined);
    vi.clearAllMocks();
  });

  describe('with live updates off', () => {
    beforeEach(() => {
      liveUpdates = false;
    });

    it('loads the scenario outside the query cache', async () => {
      // Arrange
      fetchScenarioMock.mockImplementation(loadScenario('First'));

      // Act
      renderIndex();

      // Assert
      expect(await screen.findByRole('heading', { name: 'First' })).toBeDefined();
      expect(fetchScenarioMock).toHaveBeenCalledTimes(1);
      // The scenario query stays registered but disabled: it never runs.
      expect(queryClient.getQueryCache().getAll().every(query => query.state.dataUpdatedAt === 0 && query.state.fetchStatus === 'idle')).toBe(true);
    });
  });

  describe('with live updates on', () => {
    beforeEach(() => {
      liveUpdates = true;
    });

    it('refetches the scenario when its topic is invalidated', async () => {
      // Arrange
      fetchScenarioMock
        .mockImplementationOnce(loadScenario('First'))
        .mockImplementationOnce(loadScenario('Second'));
      renderIndex();
      expect(await screen.findByRole('heading', { name: 'First' })).toBeDefined();

      // Act
      await act(() => queryClient.invalidateQueries({ queryKey: keyOfTopic(`scenario:${SCENARIO_ID}`) }));

      // Assert
      expect(await screen.findByRole('heading', { name: 'Second' })).toBeDefined();
      expect(fetchScenarioMock).toHaveBeenCalledTimes(2);
    });

    it('shows the unavailable warning on a 404, without retrying', async () => {
      // Arrange
      fetchScenarioMock.mockRejectedValue({
        status: 404,
        message: 'Not found',
      });

      // Act
      renderIndex();

      // Assert
      expect(await screen.findByText(UNAVAILABLE)).toBeDefined();
      expect(fetchScenarioMock).toHaveBeenCalledTimes(1);
    });

    it('replaces the scenario with the warning when it disappears while on screen', async () => {
      // Arrange
      fetchScenarioMock
        .mockImplementationOnce(loadScenario('First'))
        .mockRejectedValueOnce({
          status: 403,
          message: 'Forbidden',
        });
      renderIndex();
      expect(await screen.findByRole('heading', { name: 'First' })).toBeDefined();

      // Act
      await act(() => queryClient.invalidateQueries({ queryKey: keyOfTopic(`scenario:${SCENARIO_ID}`) }));

      // Assert: the store still holds the scenario, the query error alone shows the warning.
      expect(await screen.findByText(UNAVAILABLE)).toBeDefined();
      expect(storedScenario).toBeDefined();
    });
  });
});
