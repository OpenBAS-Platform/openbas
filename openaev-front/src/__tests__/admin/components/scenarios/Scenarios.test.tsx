import { createTheme, ThemeProvider } from '@mui/material/styles';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { type SearchPaginationInput } from '../../../../utils/api-types';
import { SCENARIOS_LIST_KEY } from '../../../../utils/query/keys';
import queryClient from '../../../../utils/query/queryClient';

interface PaginationProps {
  fetch: (input: SearchPaginationInput, notifyError?: boolean) => Promise<unknown>;
  queryKey?: readonly unknown[];
  setLoading?: (loading: boolean) => void;
  reloadContentCount?: number;
  topBarButtons?: ReactNode;
}

const searchScenariosMock = vi.fn(async () => ({ data: {} }));
const paginationPropsMock = vi.fn<(props: PaginationProps) => void>();
let liveUpdates = false;

vi.mock('../../../../actions/scenarios/scenario-actions', () => ({
  searchScenarios: searchScenariosMock,
  bulkDeleteScenarios: vi.fn(),
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
vi.mock('../../../../admin/components/scenarios/ImportUploaderScenario', () => ({ default: ({ refresh }: { refresh: () => void }) => <button type="button" aria-label="import" onClick={refresh} /> }));
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
    setSearchPaginationInput: vi.fn(),
  }),
}));
vi.mock('../../../../components/i18n', () => ({
  useFormatter: () => ({
    t: (s: string) => s,
    nsdt: (s: string) => s,
  }),
}));
vi.mock('../../../../utils/hooks/useAuth', () => ({ default: () => ({ isXTMHubAccessible: false }) }));
vi.mock('../../../../utils/permissions/permissionsContext', () => ({
  Can: ({ children }: { children: ReactNode }) => children,
  useAbility: () => ({ can: () => false }),
}));
vi.mock('../../../../components/Breadcrumbs', () => ({ default: () => null }));
vi.mock('../../../../components/common/ExportButton', () => ({ default: () => null }));
vi.mock('../../../../components/common/queryable/sort/SortHeadersComponentV2', () => ({ default: () => null }));
vi.mock('../../../../components/PaginatedListLoader', () => ({ default: () => null }));
vi.mock('../../../../admin/components/common/ImportFromHubButton', () => ({ default: () => null }));
vi.mock('../../../../admin/components/common/ToolBar', () => ({ default: () => null }));
vi.mock('../../../../admin/components/scenarios/ScenarioCreation', () => ({ default: () => null }));
vi.mock('../../../../admin/components/scenarios/scenario/ScenarioPopover', () => ({ default: () => null }));

// Imported after the mocks so the screen picks them up.
const { default: Scenarios } = await import('../../../../admin/components/scenarios/Scenarios');

const renderScenarios = () => render(
  <ThemeProvider theme={createTheme()}>
    <Scenarios />
  </ThemeProvider>,
);

const lastPaginationProps = () => paginationPropsMock.mock.calls[paginationPropsMock.mock.calls.length - 1][0];

const INPUT: SearchPaginationInput = {
  page: 0,
  size: 20,
};

describe('Scenarios', () => {
  beforeEach(() => {
    vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('with live updates off', () => {
    beforeEach(() => {
      liveUpdates = false;
    });

    it('fetches through its own loading wrapper, without a query key', async () => {
      // Arrange
      renderScenarios();
      const props = lastPaginationProps();

      // Act
      await act(() => props.fetch(INPUT));

      // Assert
      expect(props.queryKey).toBeUndefined();
      expect(props.setLoading).toBeUndefined();
      expect(props.fetch).not.toBe(searchScenariosMock);
      expect(searchScenariosMock).toHaveBeenCalledWith(INPUT);
    });

    it('reloads the list after an import through the reload count', () => {
      // Arrange
      renderScenarios();
      expect(lastPaginationProps().reloadContentCount).toBe(0);

      // Act
      fireEvent.click(screen.getByRole('button', { name: 'import' }));

      // Assert
      expect(lastPaginationProps().reloadContentCount).toBe(1);
      expect(queryClient.invalidateQueries).not.toHaveBeenCalled();
    });
  });

  describe('with live updates on', () => {
    beforeEach(() => {
      liveUpdates = true;
    });

    it('hands the list to the query cache under the scenarios key', () => {
      // Act
      renderScenarios();
      const props = lastPaginationProps();

      // Assert
      expect(props.queryKey).toEqual(SCENARIOS_LIST_KEY);
      expect(props.fetch).toBe(searchScenariosMock);
      expect(props.setLoading).toBeTypeOf('function');
    });

    it('refreshes the list after an import by invalidating its key', () => {
      // Arrange
      renderScenarios();

      // Act
      fireEvent.click(screen.getByRole('button', { name: 'import' }));

      // Assert
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: SCENARIOS_LIST_KEY });
      expect(lastPaginationProps().reloadContentCount).toBe(0);
    });
  });
});
