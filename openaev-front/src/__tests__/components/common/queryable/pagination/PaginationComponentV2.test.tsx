import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, render, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { type Page } from '../../../../../components/common/queryable/Page';
import { type QueryableHelpers } from '../../../../../components/common/queryable/QueryableHelpers';
import { type SearchPaginationInput } from '../../../../../utils/api-types';

const notifyErrorHandlerMock = vi.fn();

vi.mock('../../../../../components/i18n', () => ({ useFormatter: () => ({ t: (s: string) => s }) }));
vi.mock('../../../../../actions/schema/schema-action', () => ({ engineSchemas: vi.fn() }));
vi.mock('../../../../../admin/components/common/filters/KillChainSelect', () => ({ default: () => null }));
vi.mock('../../../../../admin/components/common/filters/MitreFilter', () => ({
  default: () => null,
  MITRE_FILTER_KEY: 'injector_contract_attack_patterns',
}));
vi.mock('../../../../../admin/components/common/filters/useKillChains', () => ({
  default: () => ({
    killChains: [],
    activeKillChain: undefined,
    selectKillChain: vi.fn(),
  }),
}));
vi.mock('../../../../../components/common/queryable/filter/FilterAutocomplete', () => ({ default: () => null }));
vi.mock('../../../../../components/common/queryable/filter/FilterChips', () => ({ default: () => null }));
vi.mock('../../../../../components/common/queryable/textSearch/TextSearchComponent', () => ({ default: () => null }));
vi.mock('../../../../../components/common/queryable/pagination/TablePaginationComponentV2', () => ({ default: () => null }));
vi.mock('../../../../../components/common/Drawer', () => ({ default: () => null }));
vi.mock('../../../../../components/common/chips/ClickableModeChip', () => ({ default: () => null }));
vi.mock('../../../../../utils/error/errorHandlerUtil', () => ({ notifyErrorHandler: (...args: unknown[]) => notifyErrorHandlerMock(...args) }));

// Imported after the mocks so the component picks them up.
const { default: PaginationComponentV2 } = await import('../../../../../components/common/queryable/pagination/PaginationComponentV2');

interface Row { id: string }

const page = (content: Row[], pageNumber = 0): { data: Page<Row> } => ({
  data: {
    content,
    empty: content.length === 0,
    first: pageNumber === 0,
    last: true,
    number: pageNumber,
    numberOfElements: content.length,
    pageable: {
      offset: 0,
      pageNumber,
      pageSize: 20,
      paged: true,
      sort: {
        empty: true,
        sorted: false,
        unsorted: true,
      },
      unpaged: false,
    },
    size: 20,
    sort: {
      empty: true,
      sorted: false,
      unsorted: true,
    },
    totalElements: content.length,
    totalPages: 1,
  },
});

const input = (pageNumber: number): SearchPaginationInput => ({
  page: pageNumber,
  size: 20,
});

const LIST_KEY = ['list', 'scenarios'];

interface EffectModeProps {
  searchPaginationInput: SearchPaginationInput;
  reloadContentCount?: number;
}

describe('PaginationComponentV2', () => {
  let fetch: ReturnType<typeof vi.fn<(input: SearchPaginationInput, notifyError?: boolean) => Promise<{ data: Page<Row> }>>>;
  let setContent: ReturnType<typeof vi.fn<(data: Row[]) => void>>;
  let setLoading: ReturnType<typeof vi.fn<(loading: boolean) => void>>;
  let queryableHelpers: QueryableHelpers;

  beforeEach(() => {
    fetch = vi.fn(async () => page([{ id: 'a' }]));
    setContent = vi.fn();
    setLoading = vi.fn();
    queryableHelpers = {
      paginationHelpers: {
        handleChangePage: vi.fn(),
        handleChangeTotalElements: vi.fn(),
      },
      textSearchHelpers: {},
      filterHelpers: {},
      sortHelpers: {},
    } as unknown as QueryableHelpers;
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  describe('without a queryKey', () => {
    const renderList = (props: EffectModeProps) => (
      <PaginationComponentV2<Row>
        fetch={fetch}
        setContent={setContent}
        setLoading={setLoading}
        queryableHelpers={queryableHelpers}
        disableFilters
        searchEnable={false}
        {...props}
      />
    );

    it('fetches once per input through its effect, without any query client', async () => {
      // Arrange
      const firstInput = input(0);

      // Act
      const { rerender } = render(renderList({ searchPaginationInput: firstInput }));
      await waitFor(() => expect(setContent).toHaveBeenCalledTimes(1));
      rerender(renderList({ searchPaginationInput: firstInput }));

      // Assert
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(firstInput);
      expect(setContent).toHaveBeenCalledWith([{ id: 'a' }]);
      expect(queryableHelpers.paginationHelpers.handleChangeTotalElements).toHaveBeenCalledWith(1);
      expect(setLoading.mock.calls).toEqual([[true], [false]]);
    });

    it('refetches when the reload count changes', async () => {
      // Arrange
      const firstInput = input(0);
      const { rerender } = render(renderList({ searchPaginationInput: firstInput }));
      await waitFor(() => expect(setContent).toHaveBeenCalledTimes(1));

      // Act
      rerender(renderList({
        searchPaginationInput: firstInput,
        reloadContentCount: 1,
      }));

      // Assert
      await waitFor(() => expect(setContent).toHaveBeenCalledTimes(2));
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('with a queryKey', () => {
    let queryClient: QueryClient;

    const wrap = (children: ReactNode) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;

    const renderList = (searchPaginationInput: SearchPaginationInput) => wrap(
      <PaginationComponentV2<Row>
        fetch={fetch}
        queryKey={LIST_KEY}
        searchPaginationInput={searchPaginationInput}
        setContent={setContent}
        setLoading={setLoading}
        queryableHelpers={queryableHelpers}
        disableFilters
        searchEnable={false}
      />,
    );

    beforeEach(() => {
      queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    });

    afterEach(() => {
      queryClient.clear();
    });

    it('fetches through the query, without the error toast of the call itself', async () => {
      // Arrange
      const firstInput = input(0);

      // Act
      render(renderList(firstInput));

      // Assert
      await waitFor(() => expect(setContent).toHaveBeenCalledWith([{ id: 'a' }]));
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(firstInput, false);
      expect(queryableHelpers.paginationHelpers.handleChangeTotalElements).toHaveBeenCalledWith(1);
      expect(queryClient.getQueryData([...LIST_KEY, firstInput, undefined])).toBeDefined();
    });

    it('refetches with the same input on each invalidation, without showing the loading state again', async () => {
      // Arrange
      const firstInput = input(0);
      render(renderList(firstInput));
      await waitFor(() => expect(setContent).toHaveBeenCalledTimes(1));
      fetch.mockImplementation(async () => page([{ id: 'b' }, { id: 'a' }]));

      // Act
      await act(() => queryClient.invalidateQueries({ queryKey: LIST_KEY }));
      await act(() => queryClient.invalidateQueries({ queryKey: LIST_KEY }));

      // Assert
      await waitFor(() => expect(fetch).toHaveBeenCalledTimes(3));
      expect(fetch.mock.calls.every(([calledInput]) => calledInput === firstInput)).toBe(true);
      await waitFor(() => expect(setContent).toHaveBeenLastCalledWith([{ id: 'b' }, { id: 'a' }]));
      expect(setLoading.mock.calls).toEqual([[true], [false]]);
    });

    it('keeps the current rows on screen while another page loads', async () => {
      // Arrange
      const { rerender } = render(renderList(input(0)));
      await waitFor(() => expect(setContent).toHaveBeenCalledTimes(1));
      fetch.mockImplementation(async () => page([{ id: 'c' }], 1));

      // Act
      rerender(renderList(input(1)));

      // Assert
      await waitFor(() => expect(setContent).toHaveBeenLastCalledWith([{ id: 'c' }]));
      expect(setLoading.mock.calls).toEqual([[true], [false]]);
    });

    it('shows a single error toast when the query fails', async () => {
      // Arrange
      const error = {
        status: 500,
        message: 'boom',
      };
      fetch.mockImplementation(async () => {
        throw error;
      });

      // Act
      render(renderList(input(0)));

      // Assert
      await waitFor(() => expect(notifyErrorHandlerMock).toHaveBeenCalledTimes(1));
      expect(notifyErrorHandlerMock).toHaveBeenCalledWith(error);
      expect(setContent).not.toHaveBeenCalled();
      expect(setLoading).toHaveBeenLastCalledWith(false);
    });
  });
});
