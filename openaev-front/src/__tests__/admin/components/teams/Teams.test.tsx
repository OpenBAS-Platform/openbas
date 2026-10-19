import { createTheme, ThemeProvider } from '@mui/material/styles';
import { QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { type SearchPaginationInput } from '../../../../utils/api-types';
import { TEAMS_LIST_KEY } from '../../../../utils/query/keys';
import queryClient from '../../../../utils/query/queryClient';

interface PaginationProps {
  fetch: (input: SearchPaginationInput, notifyError?: boolean) => Promise<unknown>;
  queryKey?: readonly unknown[];
  setLoading?: (loading: boolean) => void;
  topBarButtons?: ReactNode;
}

const searchTeamsMock = vi.fn(async () => ({ data: {} }));
const paginationPropsMock = vi.fn<(props: PaginationProps) => void>();
let liveUpdates = false;

vi.mock('../../../../actions/teams/team-actions', () => ({
  searchTeams: searchTeamsMock,
  bulkDeleteTeams: vi.fn(),
  updateTeamPlayers: vi.fn(),
}));
vi.mock('../../../../utils/utils', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const original = await importOriginal<typeof import('../../../../utils/utils')>();
  return {
    ...original,
    isFeatureEnabled: (feature: string) => feature === 'STREAM_INVALIDATION' && liveUpdates,
  };
});
vi.mock('../../../../components/common/queryable/pagination/PaginationComponentV2', () => ({
  default: (props: PaginationProps) => {
    paginationPropsMock(props);
    return <div>{props.topBarButtons}</div>;
  },
}));
vi.mock('../../../../admin/components/components/teams/CreateTeam', () => ({
  default: ({ onCreate }: { onCreate: (team: { team_id: string }) => void }) => (
    <button type="button" aria-label="create" onClick={() => onCreate({ team_id: 'team-new' })} />
  ),
}));
vi.mock('../../../../components/common/queryable/useQueryableWithLocalStorage', () => ({
  useQueryableWithLocalStorage: () => ({
    queryableHelpers: {
      paginationHelpers: {
        getTotalElements: () => 0,
        handleChangeTotalElements: vi.fn(),
      },
      sortHelpers: {},
    },
    searchPaginationInput: {
      page: 0,
      size: 20,
    },
  }),
}));
vi.mock('../../../../store', () => ({ useHelper: () => ({ teams: [] }) }));
vi.mock('../../../../components/i18n', () => ({
  useFormatter: () => ({
    t: (s: string) => s,
    nsdt: (s: string) => s,
  }),
}));
vi.mock('../../../../utils/hooks', () => ({ useAppDispatch: () => vi.fn() }));
vi.mock('../../../../utils/permissions/permissionsContext', () => ({
  Can: ({ children }: { children: ReactNode }) => children,
  useAbility: () => ({ can: () => false }),
}));
vi.mock('../../../../components/Breadcrumbs', () => ({ default: () => null }));
vi.mock('../../../../components/ItemTags', () => ({ default: () => null }));
vi.mock('../../../../components/common/ExportButton', () => ({ default: () => null }));
vi.mock('../../../../components/common/queryable/sort/SortHeadersComponentV2', () => ({ default: () => null }));
vi.mock('../../../../components/PaginatedListLoader', () => ({ default: () => null }));
vi.mock('../../../../admin/components/common/ToolBar', () => ({ default: () => null }));
vi.mock('../../../../admin/components/components/teams/TeamPopover', () => ({ default: () => null }));
vi.mock('../../../../admin/components/components/teams/TeamPlayers', () => ({ default: () => null }));

// Imported after the mocks so the screen picks them up.
const { default: Teams } = await import('../../../../admin/components/teams/Teams');

const renderTeams = () => render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider theme={createTheme()}>
      <MemoryRouter>
        <Teams />
      </MemoryRouter>
    </ThemeProvider>
  </QueryClientProvider>,
);

const lastPaginationProps = () => paginationPropsMock.mock.calls[paginationPropsMock.mock.calls.length - 1][0];

const INPUT: SearchPaginationInput = {
  page: 0,
  size: 20,
};

describe('Teams', () => {
  afterEach(() => {
    cleanup();
    queryClient.clear();
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('with live updates off', () => {
    beforeEach(() => {
      liveUpdates = false;
    });

    it('fetches through its own loading wrapper and patches the rows on create', async () => {
      // Arrange
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      renderTeams();
      const props = lastPaginationProps();

      // Act
      await act(() => props.fetch(INPUT));
      fireEvent.click(screen.getByRole('button', { name: 'create' }));

      // Assert
      expect(props.queryKey).toBeUndefined();
      expect(props.setLoading).toBeUndefined();
      expect(props.fetch).not.toBe(searchTeamsMock);
      expect(searchTeamsMock).toHaveBeenCalledWith(INPUT);
      expect(invalidateSpy).not.toHaveBeenCalled();
    });
  });

  describe('with live updates on', () => {
    beforeEach(() => {
      liveUpdates = true;
    });

    it('hands the list to the query cache under the teams key', () => {
      // Act
      renderTeams();
      const props = lastPaginationProps();

      // Assert
      expect(props.queryKey).toEqual(TEAMS_LIST_KEY);
      expect(props.fetch).toBe(searchTeamsMock);
      expect(props.setLoading).toBeTypeOf('function');
    });

    it('invalidates the teams key after a creation', () => {
      // Arrange
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue();
      renderTeams();

      // Act
      fireEvent.click(screen.getByRole('button', { name: 'create' }));

      // Assert
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: TEAMS_LIST_KEY });
    });
  });
});
