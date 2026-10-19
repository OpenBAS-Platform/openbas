import { QueryClient, QueryClientProvider, type QueryKey } from '@tanstack/react-query';
import { act, cleanup, render, waitFor } from '@testing-library/react';
import { useEffect } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { scenarioKey } from '../../../../../../utils/query/keys';

const SCENARIO_ID = 'scenario-1';

const fetchInjectsMock = vi.fn((scenarioId: string) => ({
  type: 'injects',
  scenarioId,
}));
const fetchTeamsMock = vi.fn((scenarioId: string) => ({
  type: 'teams',
  scenarioId,
}));
const fetchVariablesMock = vi.fn((scenarioId: string) => ({
  type: 'variables',
  scenarioId,
}));
const fetchDocumentsMock = vi.fn((scenarioId: string) => ({
  type: 'documents',
  scenarioId,
}));
const injectsPropsMock = vi.fn<(props: { queryKey?: QueryKey }) => void>();
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
    scenario: {
      scenario_id: SCENARIO_ID,
      scenario_teams_users: [],
    },
    teams: [],
    articles: [],
    variables: [],
  }),
}));
vi.mock('../../../../../../actions/scenarios/scenario-inject-actions', () => ({ fetchScenarioInjectsSimple: fetchInjectsMock }));
vi.mock('../../../../../../actions/scenarios/scenario-actions', () => ({ fetchScenarioTeams: fetchTeamsMock }));
vi.mock('../../../../../../actions/variables/variable-actions', () => ({ fetchVariablesForScenario: fetchVariablesMock }));
vi.mock('../../../../../../actions/documents/documents-actions', () => ({ fetchScenarioDocuments: fetchDocumentsMock }));
vi.mock('../../../../../../actions/challenge-action', () => ({ fetchScenarioChallenges: vi.fn() }));
vi.mock('../../../../../../actions/inject_test/scenario-inject-test-actions', () => ({ testInject: vi.fn() }));
vi.mock('../../../../../../admin/components/common/injects/Injects', () => ({
  default: (props: { queryKey?: QueryKey }) => {
    injectsPropsMock(props);
    return null;
  },
}));

// Imported after the mocks so the screen picks them up.
const { default: ScenarioInjects } = await import('../../../../../../admin/components/scenarios/scenario/injects/ScenarioInjects');

let queryClient: QueryClient;

const renderInjects = () => render(
  <QueryClientProvider client={queryClient}>
    <ScenarioInjects />
  </QueryClientProvider>,
);

const lastInjectsProps = () => injectsPropsMock.mock.calls[injectsPropsMock.mock.calls.length - 1][0];

const expectLoadedTimes = (times: number) => {
  expect(fetchInjectsMock).toHaveBeenCalledTimes(times);
  expect(fetchTeamsMock).toHaveBeenCalledTimes(times);
  expect(fetchVariablesMock).toHaveBeenCalledTimes(times);
  expect(fetchDocumentsMock).toHaveBeenCalledTimes(times);
};

describe('ScenarioInjects', () => {
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

    it('lists the injects through a query under the scenario key', () => {
      // Act
      renderInjects();

      // Assert
      expect(lastInjectsProps().queryKey).toEqual([...scenarioKey(SCENARIO_ID), 'injects', 'list']);
    });

    it('reloads the store datasets when the scenario key is invalidated', async () => {
      // Arrange
      renderInjects();
      await waitFor(() => expectLoadedTimes(1));
      expect(fetchInjectsMock).toHaveBeenCalledWith(SCENARIO_ID);

      // Act
      await act(() => queryClient.invalidateQueries({ queryKey: scenarioKey(SCENARIO_ID) }));

      // Assert
      await waitFor(() => expectLoadedTimes(2));
    });

    it('ignores the invalidation of another scenario', async () => {
      // Arrange
      renderInjects();
      await waitFor(() => expectLoadedTimes(1));

      // Act
      await act(() => queryClient.invalidateQueries({ queryKey: scenarioKey('scenario-2') }));

      // Assert
      expect(fetchInjectsMock).toHaveBeenCalledTimes(1);
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
      await act(() => queryClient.invalidateQueries({ queryKey: scenarioKey(SCENARIO_ID) }));

      // Assert
      expect(lastInjectsProps().queryKey).toBeUndefined();
      expectLoadedTimes(1);
      expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
    });
  });
});
