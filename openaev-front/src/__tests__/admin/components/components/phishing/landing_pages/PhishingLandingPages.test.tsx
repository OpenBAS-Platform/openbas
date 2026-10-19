import { createTheme, ThemeProvider } from '@mui/material/styles';
import { QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useEffect } from 'react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { type PhishingLandingPage, type SearchPaginationInput } from '../../../../../../utils/api-types';
import { COMPONENTS_LIST_KEY } from '../../../../../../utils/query/keys';
import queryClient from '../../../../../../utils/query/queryClient';

interface PaginationProps {
  fetch: (input: SearchPaginationInput, notifyError?: boolean) => Promise<unknown>;
  queryKey?: readonly unknown[];
  setContent: (content: PhishingLandingPage[]) => void;
  setLoading?: (loading: boolean) => void;
}

const LANDING_PAGE = {
  phishing_landing_page_id: 'landing-page-1',
  phishing_landing_page_name: 'Login page',
} as PhishingLandingPage;

const searchLandingPagesMock = vi.fn(async () => ({ data: {} }));
const paginationPropsMock = vi.fn<(props: PaginationProps) => void>();
let liveUpdates = false;

vi.mock('../../../../../../actions/phishing/phishing-action', () => ({
  searchPhishingLandingPages: searchLandingPagesMock,
  bulkDeletePhishingLandingPages: vi.fn(),
}));
vi.mock('../../../../../../utils/utils', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const original = await importOriginal<typeof import('../../../../../../utils/utils')>();
  return {
    ...original,
    isFeatureEnabled: (feature: string) => feature === 'STREAM_INVALIDATION' && liveUpdates,
  };
});
// Hands one row to the screen once, as a loaded page would.
vi.mock('../../../../../../components/common/queryable/pagination/PaginationComponentV2', () => ({
  default: (props: PaginationProps) => {
    paginationPropsMock(props);
    useEffect(() => {
      props.setContent([LANDING_PAGE]);
      props.setLoading?.(false);
    }, []);
    return null;
  },
}));
vi.mock('../../../../../../admin/components/components/phishing/landing_pages/PhishingLandingPagePopover', () => ({
  default: ({ onDelete }: { onDelete: (id: string) => void }) => (
    <button type="button" aria-label="delete" onClick={() => onDelete(LANDING_PAGE.phishing_landing_page_id)} />
  ),
}));
vi.mock('../../../../../../components/common/queryable/useQueryableWithLocalStorage', () => ({
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
vi.mock('../../../../../../components/i18n', () => ({
  useFormatter: () => ({
    t: (s: string) => s,
    nsdt: (s: string) => s,
  }),
}));
vi.mock('../../../../../../utils/permissions/permissionsContext', () => ({
  Can: () => null,
  useAbility: () => ({ can: () => false }),
}));
vi.mock('../../../../../../components/common/queryable/sort/SortHeadersComponentV2', () => ({ default: () => null }));
vi.mock('../../../../../../components/PaginatedListLoader', () => ({ default: () => <div role="progressbar" /> }));
vi.mock('../../../../../../admin/components/common/ToolBar', () => ({ default: () => null }));

// Imported after the mocks so the screen picks them up.
const { default: PhishingLandingPages } = await import('../../../../../../admin/components/components/phishing/landing_pages/PhishingLandingPages');

const renderLandingPages = () => render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider theme={createTheme()}>
      <MemoryRouter>
        <PhishingLandingPages />
      </MemoryRouter>
    </ThemeProvider>
  </QueryClientProvider>,
);

const lastPaginationProps = () => paginationPropsMock.mock.calls[paginationPropsMock.mock.calls.length - 1][0];

const INPUT: SearchPaginationInput = {
  page: 0,
  size: 20,
};

describe('PhishingLandingPages', () => {
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

    it('fetches through its own loading wrapper, without a query key', async () => {
      // Arrange
      renderLandingPages();
      const props = lastPaginationProps();

      // Act
      await act(() => props.fetch(INPUT));

      // Assert
      expect(props.queryKey).toBeUndefined();
      expect(props.setLoading).toBeUndefined();
      expect(props.fetch).not.toBe(searchLandingPagesMock);
      expect(searchLandingPagesMock).toHaveBeenCalledWith(INPUT);
    });

    it('removes a deleted row locally without touching the query cache', async () => {
      // Arrange
      const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
      renderLandingPages();
      await act(() => lastPaginationProps().fetch(INPUT));

      // Act
      fireEvent.click(await screen.findByRole('button', { name: 'delete' }));

      // Assert
      expect(screen.queryByText('Login page')).toBeNull();
      expect(invalidate).not.toHaveBeenCalled();
    });
  });

  describe('with live updates on', () => {
    beforeEach(() => {
      liveUpdates = true;
    });

    it('hands the list to the query cache under the components key', () => {
      // Act
      renderLandingPages();
      const props = lastPaginationProps();

      // Assert
      expect(props.queryKey?.slice(0, 2)).toEqual([...COMPONENTS_LIST_KEY]);
      expect(props.fetch).toBe(searchLandingPagesMock);
      expect(props.setLoading).toBeDefined();
    });

    it('invalidates the components key after a local delete', async () => {
      // Arrange
      const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
      renderLandingPages();

      // Act
      fireEvent.click(await screen.findByRole('button', { name: 'delete' }));

      // Assert
      expect(invalidate).toHaveBeenCalledWith({ queryKey: COMPONENTS_LIST_KEY });
    });
  });
});
