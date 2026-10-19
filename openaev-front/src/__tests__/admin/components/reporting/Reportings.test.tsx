import { QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { type SearchPaginationInput } from '../../../../utils/api-types';
import { reportKey, REPORTS_LIST_KEY } from '../../../../utils/query/keys';
import queryClient from '../../../../utils/query/queryClient';

interface PaginationProps {
  fetch: (input: SearchPaginationInput, notifyError?: boolean) => Promise<unknown>;
  queryKey?: readonly unknown[];
  setLoading?: (loading: boolean) => void;
  setContent: (content: unknown[]) => void;
}

interface CardProps {
  reporting: { reporting_id: string };
  onUpdate: (reporting: { reporting_id: string }) => void;
  onDelete: (reportingId: string) => void;
}

const REPORTING = {
  reporting_id: 'reporting-1',
  reporting_name: 'Monthly',
};

const searchReportingsMock = vi.fn(async () => ({ data: {} }));
const paginationPropsMock = vi.fn<(props: PaginationProps) => void>();
let liveUpdates = false;

vi.mock('../../../../actions/reporting/reporting-actions', () => ({
  searchReportings: searchReportingsMock,
  downloadReportingGenerationUrl: (id: string) => `/download/${id}`,
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
    return null;
  },
}));
vi.mock('../../../../components/common/queryable/useQueryableWithLocalStorage', () => ({
  useQueryableWithLocalStorage: () => ({
    queryableHelpers: {
      paginationHelpers: { getTotalElements: () => 0 },
      sortHelpers: {},
    },
    searchPaginationInput: {
      page: 0,
      size: 20,
    },
  }),
}));
vi.mock('../../../../components/i18n', () => ({
  useFormatter: () => ({
    t: (s: string) => s,
    fldt: (s: string) => s,
  }),
}));
vi.mock('../../../../components/Breadcrumbs', () => ({ default: () => null }));
vi.mock('../../../../components/common/queryable/sort/SortHeadersComponentV2', () => ({ default: () => null }));
vi.mock('../../../../components/PaginatedListLoader', () => ({ default: () => null }));
vi.mock('../../../../admin/components/reporting/ReportingCreation', () => ({ default: () => null }));
vi.mock('../../../../admin/components/reporting/ReportingPopover', () => ({ default: () => null }));
vi.mock('../../../../admin/components/reporting/ReportingCard', () => ({
  default: ({ reporting, onUpdate, onDelete }: CardProps) => (
    <div>
      <button type="button" aria-label="update" onClick={() => onUpdate(reporting)} />
      <button type="button" aria-label="delete" onClick={() => onDelete(reporting.reporting_id)} />
    </div>
  ),
}));
vi.mock('@filigran/design-system', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const original = await importOriginal<typeof import('@filigran/design-system')>();
  return {
    ...original,
    ButtonGroup: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    ButtonGroupItem: () => null,
    Tooltip: ({ children }: { children: ReactNode }) => children,
    TooltipTrigger: ({ children }: { children: ReactNode }) => children,
    TooltipContent: () => null,
  };
});

// Imported after the mocks so the screen picks them up.
const { default: Reportings } = await import('../../../../admin/components/reporting/Reportings');

const renderReportings = () => render(
  <QueryClientProvider client={queryClient}>
    <MemoryRouter>
      <Reportings />
    </MemoryRouter>
  </QueryClientProvider>,
);

const lastPaginationProps = () => paginationPropsMock.mock.calls[paginationPropsMock.mock.calls.length - 1][0];

const INPUT: SearchPaginationInput = {
  page: 0,
  size: 20,
};

describe('Reportings', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

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

    it('fetches through its own loading wrapper and patches rows locally', async () => {
      // Arrange
      const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
      renderReportings();
      const props = lastPaginationProps();

      // Act
      await act(() => props.fetch(INPUT));
      act(() => props.setContent([REPORTING]));
      fireEvent.click(screen.getByRole('button', { name: 'delete' }));

      // Assert
      expect(props.queryKey).toBeUndefined();
      expect(props.setLoading).toBeUndefined();
      expect(props.fetch).not.toBe(searchReportingsMock);
      expect(searchReportingsMock).toHaveBeenCalledWith(INPUT);
      expect(screen.queryByRole('button', { name: 'delete' })).toBeNull();
      expect(invalidate).not.toHaveBeenCalled();
    });
  });

  describe('with live updates on', () => {
    beforeEach(() => {
      liveUpdates = true;
    });

    it('hands the list to the query cache under the reports key', () => {
      // Act
      renderReportings();
      const props = lastPaginationProps();

      // Assert
      expect(props.queryKey).toEqual(REPORTS_LIST_KEY);
      expect(props.fetch).toBe(searchReportingsMock);
      expect(props.setLoading).toBeDefined();
    });

    it('invalidates the reports key after a local update or deletion', () => {
      // Arrange
      const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
      renderReportings();
      act(() => {
        lastPaginationProps().setLoading?.(false);
        lastPaginationProps().setContent([REPORTING]);
      });

      // Act
      fireEvent.click(screen.getByRole('button', { name: 'update' }));
      fireEvent.click(screen.getByRole('button', { name: 'delete' }));

      // Assert
      expect(invalidate).toHaveBeenCalledWith({ queryKey: REPORTS_LIST_KEY });
      expect(invalidate).toHaveBeenCalledWith({ queryKey: reportKey(REPORTING.reporting_id) });
      expect(invalidate).toHaveBeenCalledTimes(3);
      // The rows wait for the refetch instead of being patched.
      expect(screen.getByRole('button', { name: 'delete' })).toBeDefined();
    });
  });
});
