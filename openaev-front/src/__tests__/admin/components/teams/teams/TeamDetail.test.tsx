import { createTheme, ThemeProvider } from '@mui/material/styles';
import { QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { type ReactNode, useEffect } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { keyOfTopic, teamKey } from '../../../../../utils/query/keys';
import queryClient from '../../../../../utils/query/queryClient';

const TEAM_ID = 'team-1';

const team = (name: string) => ({
  team_id: TEAM_ID,
  team_name: name,
  team_users: [],
  team_tags: [],
});

let storedTeam: ReturnType<typeof team> | undefined;
const fetchTeamMock = vi.fn<(teamId: string) => unknown>();
const fetchTeamPlayersMock = vi.fn((_teamId: string) => Promise.resolve());
const fetchOrganizationsMock = vi.fn(() => Promise.resolve());
const listQueryKeys: Record<string, readonly unknown[] | undefined> = {};
let liveUpdates = false;

vi.mock('../../../../../actions/teams/team-actions', () => ({
  fetchTeam: fetchTeamMock,
  fetchTeamPlayers: fetchTeamPlayersMock,
  searchInjectsForTeam: vi.fn(),
  searchTeams: vi.fn(),
  updateTeamPlayers: vi.fn(),
}));
vi.mock('../../../../../actions/Organization', () => ({ fetchOrganizations: fetchOrganizationsMock }));
vi.mock('../../../../../actions/players/player-actions', () => ({ searchPlayers: vi.fn() }));
vi.mock('../../../../../actions/findings/finding-actions', () => ({ searchDistinctFindings: vi.fn() }));
vi.mock('../../../../../utils/utils', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const original = await importOriginal<typeof import('../../../../../utils/utils')>();
  return {
    ...original,
    isFeatureEnabled: (feature: string) => feature === 'STREAM_INVALIDATION' && liveUpdates,
  };
});
vi.mock('../../../../../components/i18n', () => ({
  useFormatter: () => ({
    t: (s: string) => s,
    fldt: (s: string) => s,
  }),
}));
vi.mock('../../../../../store', () => ({
  useHelper: () => ({
    team: storedTeam,
    usersMap: {},
    organizationsMap: {},
  }),
}));
// The dispatched value is what the mocked fetch action returned.
vi.mock('../../../../../utils/hooks', () => ({ useAppDispatch: () => (action: unknown) => action }));
vi.mock('../../../../../utils/hooks/useDataLoader', () => ({
  default: (load: () => void) => {
    useEffect(() => {
      load();
    }, []);
  },
}));
vi.mock('../../../../../utils/permissions/permissionsContext', () => ({ useAbility: () => ({ can: () => false }) }));
vi.mock('../../../../../components/common/queryable/useQueryableWithLocalStorage', () => ({
  useQueryableWithLocalStorage: () => ({
    queryableHelpers: { sortHelpers: {} },
    searchPaginationInput: {
      page: 0,
      size: 20,
    },
  }),
}));
vi.mock('../../../../../components/Breadcrumbs', () => ({ default: () => null }));
vi.mock('../../../../../components/ItemTags', () => ({ default: () => null }));
vi.mock('../../../../../components/ExpandableMarkdown', () => ({ default: () => null }));
vi.mock('../../../../../components/Loader', () => ({ default: () => <div role="progressbar" /> }));
vi.mock('../../../../../components/common/queryable/sort/SortHeadersComponentV2', () => ({ default: () => null }));
vi.mock('../../../../../components/common/detail/EntityDetailCommon', () => ({
  DetailHero: ({ title }: { title: string }) => <h1>{title}</h1>,
  HeroStat: () => null,
  InformationGrid: ({ children }: { children: ReactNode }) => <>{children}</>,
  SectionBlock: ({ children }: { children: ReactNode }) => <>{children}</>,
  Field: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock('../../../../../components/common/queryable/pagination/PaginationComponentV2', () => ({
  default: ({ queryKey }: { queryKey?: readonly unknown[] }) => {
    listQueryKeys.persons = queryKey;
    return null;
  },
}));
vi.mock('../../../../../admin/components/findings/FindingList', () => ({
  default: ({ queryKey }: { queryKey?: readonly unknown[] }) => {
    listQueryKeys.findings = queryKey;
    return null;
  },
}));
vi.mock('../../../../../admin/components/atomic_testings/InjectResultList', () => ({
  default: ({ queryKey }: { queryKey?: readonly unknown[] }) => {
    listQueryKeys.injects = queryKey;
    return null;
  },
}));
vi.mock('../../../../../admin/components/reporting/EntityReportsPanel', () => ({ default: () => null }));
vi.mock('../../../../../admin/components/components/teams/TeamPopover', () => ({ default: () => null }));
vi.mock('../../../../../admin/components/components/teams/TeamPlayers', () => ({ default: () => null }));

// Imported after the mocks so the screen picks them up.
const { default: TeamDetail } = await import('../../../../../admin/components/teams/teams/TeamDetail');

const renderTeamDetail = () => render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider theme={createTheme()}>
      <MemoryRouter initialEntries={[`/admin/teams/${TEAM_ID}`]}>
        <Routes>
          <Route path="/admin/teams/:teamId" element={<TeamDetail />} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>
  </QueryClientProvider>,
);

const UNAVAILABLE = 'Team is currently unavailable or you do not have sufficient permissions to access it.';
const invalidateTeamTopic = () => act(() => queryClient.invalidateQueries({ queryKey: keyOfTopic(`team:${TEAM_ID}`) }));

describe('TeamDetail', () => {
  beforeEach(() => {
    storedTeam = team('First');
    fetchTeamMock.mockReturnValue(Promise.resolve());
  });

  afterEach(() => {
    cleanup();
    queryClient.clear();
    vi.clearAllMocks();
    Object.keys(listQueryKeys).forEach((key) => {
      delete listQueryKeys[key];
    });
  });

  describe('with live updates off', () => {
    beforeEach(() => {
      liveUpdates = false;
    });

    it('loads the team through the data loader and its lists outside the query cache', async () => {
      // Act
      renderTeamDetail();

      // Assert
      expect(await screen.findByRole('heading', { name: 'First' })).toBeDefined();
      expect(fetchTeamMock).toHaveBeenCalledTimes(1);
      expect(fetchTeamPlayersMock).toHaveBeenCalledTimes(1);
      expect(listQueryKeys.persons).toBeUndefined();
      expect(listQueryKeys.findings).toBeUndefined();
      expect(listQueryKeys.injects).toBeUndefined();
      // Disabled queries register in the cache but never run.
      expect(queryClient.getQueryCache().getAll().every(query => query.state.dataUpdateCount === 0)).toBe(true);
    });
  });

  describe('with live updates on', () => {
    beforeEach(() => {
      liveUpdates = true;
    });

    it('puts every list of the screen under the team key', async () => {
      // Act
      renderTeamDetail();
      expect(await screen.findByRole('heading', { name: 'First' })).toBeDefined();

      // Assert
      [listQueryKeys.persons, listQueryKeys.findings, listQueryKeys.injects].forEach((queryKey) => {
        expect(queryKey?.slice(0, 2)).toEqual([...teamKey(TEAM_ID)]);
      });
      // The organizations referential still comes from the data loader.
      expect(fetchOrganizationsMock).toHaveBeenCalledTimes(1);
    });

    it('reloads the team and its players when its topic is invalidated', async () => {
      // Arrange
      renderTeamDetail();
      await waitFor(() => expect(fetchTeamMock).toHaveBeenCalledTimes(1));

      // Act
      await invalidateTeamTopic();

      // Assert
      await waitFor(() => expect(fetchTeamMock).toHaveBeenCalledTimes(2));
      expect(fetchTeamPlayersMock).toHaveBeenCalledTimes(2);
    });

    it('replaces the screen with the unavailable warning when the team disappears', async () => {
      // Arrange
      renderTeamDetail();
      expect(await screen.findByRole('heading', { name: 'First' })).toBeDefined();
      await waitFor(() => expect(fetchTeamMock).toHaveBeenCalledTimes(1));
      fetchTeamMock.mockReturnValue(Promise.reject(Object.assign(new Error('Not found'), { status: 404 })));

      // Act
      await invalidateTeamTopic();

      // Assert
      expect(await screen.findByText(UNAVAILABLE)).toBeDefined();
    });
  });
});
