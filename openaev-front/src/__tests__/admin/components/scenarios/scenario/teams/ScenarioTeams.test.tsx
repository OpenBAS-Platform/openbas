import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, render, waitFor } from '@testing-library/react';
import { type ReactNode, useEffect } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { scenarioKey } from '../../../../../../utils/query/keys';

const SCENARIO_ID = 'scenario-1';

const fetchTeamsMock = vi.fn((scenarioId: string) => ({
  type: 'teams',
  scenarioId,
}));
let liveUpdates = false;

vi.mock('react-router', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const original = await importOriginal<typeof import('react-router')>();
  return {
    ...original,
    useParams: () => ({ scenarioId: SCENARIO_ID }),
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
vi.mock('../../../../../../store', () => ({ useHelper: () => ({ teamsStore: [] }) }));
vi.mock('../../../../../../actions/scenarios/scenario-actions', () => ({ fetchScenarioTeams: fetchTeamsMock }));
vi.mock('../../../../../../components/i18n', () => ({ useFormatter: () => ({ t: (s: string) => s }) }));
vi.mock('../../../../../../admin/components/common/ConfigurationSection', () => ({ default: ({ children }: { children: ReactNode }) => children }));
vi.mock('../../../../../../admin/components/components/teams/ContextualTeams', () => ({ default: () => null }));
vi.mock('../../../../../../admin/components/components/teams/UpdateTeams', () => ({ default: () => null }));

// Imported after the mocks so the screen picks them up.
const { default: ScenarioTeams } = await import('../../../../../../admin/components/scenarios/scenario/teams/ScenarioTeams');

let queryClient: QueryClient;

const renderTeams = () => render(
  <QueryClientProvider client={queryClient}>
    <ScenarioTeams scenarioTeamsUsers={[]} />
    {/* A second screen reading the same dataset, as the header does. */}
    <ScenarioTeams scenarioTeamsUsers={[]} />
  </QueryClientProvider>,
);

describe('ScenarioTeams', () => {
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

    it('loads the teams once for every screen reading them, then again on each invalidation', async () => {
      // Arrange
      renderTeams();
      await waitFor(() => expect(fetchTeamsMock).toHaveBeenCalledTimes(1));
      expect(queryClient.getQueryCache().find({ queryKey: [...scenarioKey(SCENARIO_ID), 'teams'] })).toBeDefined();

      // Act
      await act(() => queryClient.invalidateQueries({ queryKey: scenarioKey(SCENARIO_ID) }));

      // Assert
      await waitFor(() => expect(fetchTeamsMock).toHaveBeenCalledTimes(2));
      expect(fetchTeamsMock).toHaveBeenLastCalledWith(SCENARIO_ID);
    });
  });

  describe('with live updates off', () => {
    beforeEach(() => {
      liveUpdates = false;
    });

    it('loads the teams through the data loader of each screen', async () => {
      // Act
      renderTeams();
      await act(() => queryClient.invalidateQueries({ queryKey: scenarioKey(SCENARIO_ID) }));

      // Assert
      expect(fetchTeamsMock).toHaveBeenCalledTimes(2);
      expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
    });
  });
});
