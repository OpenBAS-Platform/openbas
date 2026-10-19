import { TooltipProvider } from '@filigran/design-system';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { type CustomDashboard, type SearchPaginationInput } from '../../../../../utils/api-types';
import { DASHBOARDS_LIST_KEY } from '../../../../../utils/query/keys';
import queryClient from '../../../../../utils/query/queryClient';

interface PaginationProps {
  fetch: (input: SearchPaginationInput, notifyError?: boolean) => Promise<unknown>;
  queryKey?: readonly unknown[];
  setLoading?: (loading: boolean) => void;
  setContent: (content: CustomDashboard[]) => void;
}

const searchCustomDashboardsMock = vi.fn(async () => ({ data: {} }));
const paginationPropsMock = vi.fn<(props: PaginationProps) => void>();
let liveUpdates = false;

vi.mock('../../../../../actions/custom_dashboards/customdashboard-action', () => ({
  searchCustomDashboards: searchCustomDashboardsMock,
  importCustomDashboard: vi.fn(),
}));
vi.mock('../../../../../utils/utils', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const original = await importOriginal<typeof import('../../../../../utils/utils')>();
  return {
    ...original,
    isFeatureEnabled: (feature: string) => feature === 'STREAM_INVALIDATION' && liveUpdates,
  };
});
vi.mock('../../../../../components/common/queryable/pagination/PaginationComponentV2', () => ({
  default: (props: PaginationProps) => {
    paginationPropsMock(props);
    return null;
  },
}));
vi.mock('../../../../../components/common/queryable/useQueryableWithLocalStorage', () => ({
  useQueryableWithLocalStorage: () => ({
    queryableHelpers: {
      sortHelpers: {},
      paginationHelpers: { incrementTotalElements: vi.fn() },
    },
    searchPaginationInput: {
      page: 0,
      size: 20,
    },
  }),
}));
vi.mock('../../../../../admin/components/workspaces/custom_dashboards/CustomDashboardCard', () => ({
  default: ({ customDashboard, onDelete }: {
    customDashboard: CustomDashboard;
    onDelete: (id: string) => void;
  }) => (
    <button type="button" onClick={() => onDelete(customDashboard.custom_dashboard_id)}>
      {`delete ${customDashboard.custom_dashboard_name}`}
    </button>
  ),
}));
vi.mock('../../../../../components/i18n', () => ({ useFormatter: () => ({ t: (s: string) => s }) }));
vi.mock('../../../../../utils/permissions/permissionsContext', () => ({ Can: ({ children }: { children: ReactNode }) => children }));
vi.mock('../../../../../components/Breadcrumbs', () => ({ default: () => null }));
vi.mock('../../../../../components/common/import/ImportUploaderJsonApiComponent', () => ({ default: () => null }));
vi.mock('../../../../../admin/components/workspaces/custom_dashboards/CustomDashboardCreation', () => ({ default: () => null }));
vi.mock('../../../../../admin/components/workspaces/custom_dashboards/CustomDashboardPopover', () => ({ default: () => null }));

// Imported after the mocks so the screen picks them up.
const { default: CustomDashboards } = await import('../../../../../admin/components/workspaces/custom_dashboards/CustomDashboards');

const renderList = () => render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider theme={createTheme()}>
      <TooltipProvider>
        <MemoryRouter>
          <CustomDashboards />
        </MemoryRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>,
);

const lastPaginationProps = () => paginationPropsMock.mock.calls[paginationPropsMock.mock.calls.length - 1][0];

const DASHBOARD = {
  custom_dashboard_id: 'dashboard-1',
  custom_dashboard_name: 'Board',
} as CustomDashboard;

// The list shows its skeleton until the content arrives: hand it one row through the props.
const showRow = async (props: PaginationProps) => {
  await act(async () => {
    props.setContent([DASHBOARD]);
    props.setLoading?.(false);
  });
};

describe('CustomDashboards', () => {
  afterEach(() => {
    cleanup();
    queryClient.clear();
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('with live updates on', () => {
    it('hands the list to the query cache under the dashboards key', () => {
      // Arrange
      liveUpdates = true;

      // Act
      renderList();
      const props = lastPaginationProps();

      // Assert
      expect(props.queryKey).toEqual(DASHBOARDS_LIST_KEY);
      expect(props.fetch).toBe(searchCustomDashboardsMock);
      expect(props.setLoading).toBeTypeOf('function');
    });

    it('invalidates the dashboards key after a deletion instead of patching the rows', async () => {
      // Arrange
      liveUpdates = true;
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue();
      renderList();
      await showRow(lastPaginationProps());

      // Act
      fireEvent.click(screen.getByRole('button', { name: 'delete Board' }));

      // Assert
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: DASHBOARDS_LIST_KEY });
      expect(screen.getByRole('button', { name: 'delete Board' })).toBeDefined();
    });
  });

  describe('with live updates off', () => {
    it('fetches through its own loading wrapper and patches the rows on delete', async () => {
      // Arrange
      liveUpdates = false;
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      renderList();
      const props = lastPaginationProps();
      await act(async () => {
        await props.fetch({
          page: 0,
          size: 20,
        });
      });
      await showRow(props);

      // Act
      fireEvent.click(screen.getByRole('button', { name: 'delete Board' }));

      // Assert
      expect(props.queryKey).toBeUndefined();
      expect(props.setLoading).toBeUndefined();
      expect(props.fetch).not.toBe(searchCustomDashboardsMock);
      expect(searchCustomDashboardsMock).toHaveBeenCalledWith({
        page: 0,
        size: 20,
      });
      expect(screen.queryByRole('button', { name: 'delete Board' })).toBeNull();
      expect(invalidateSpy).not.toHaveBeenCalled();
    });
  });
});
