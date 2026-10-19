import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { type Page } from '../../../../components/common/queryable/Page';
import { type SearchPaginationInput } from '../../../../utils/api-types';

vi.mock('../../../../components/i18n', () => ({ useFormatter: () => ({ t: (s: string) => s }) }));
vi.mock('../../../../admin/components/common/filters/KillChainSelect', () => ({ default: () => null }));
vi.mock('../../../../admin/components/common/filters/MitreFilter', () => ({
  default: () => null,
  MITRE_FILTER_KEY: 'injector_contract_attack_patterns',
}));
vi.mock('../../../../admin/components/common/filters/useKillChains', () => ({
  default: () => ({
    killChains: [],
    activeKillChain: undefined,
    selectKillChain: vi.fn(),
  }),
}));
vi.mock('../../../../components/SearchFilter', () => ({ default: () => null }));
vi.mock('../../../../components/common/ExportButton', () => ({ default: () => null }));
vi.mock('../../../../components/common/Drawer', () => ({ default: () => null }));

// Imported after the mocks so the component picks them up.
const { default: PaginationComponent } = await import('../../../../components/common/pagination/PaginationComponent');

interface Row { id: string }

const page = (content: Row[]): { data: Page<Row> } => ({
  data: {
    content,
    totalElements: content.length,
    totalPages: 1,
    pageable: { pageNumber: 0 },
  } as unknown as Page<Row>,
});

const KEY = ['scenario', 'scenario-1', 'inject-tests'];
const INPUT: SearchPaginationInput = {
  page: 0,
  size: 20,
};

const fetchMock = vi.fn<(input: SearchPaginationInput, notifyError?: boolean) => Promise<{ data: Page<Row> }>>();
const setContentMock = vi.fn<(rows: Row[]) => void>();
let queryClient: QueryClient;

const renderPagination = (queryKey?: string[]) => render(
  <QueryClientProvider client={queryClient}>
    <PaginationComponent
      fetch={fetchMock}
      searchPaginationInput={INPUT}
      setContent={setContentMock}
      queryKey={queryKey}
    />
  </QueryClientProvider>,
);

describe('PaginationComponent', () => {
  beforeEach(() => {
    queryClient = new QueryClient();
    fetchMock.mockResolvedValue(page([{ id: 'a' }]));
  });

  afterEach(() => {
    cleanup();
    queryClient.clear();
    vi.clearAllMocks();
  });

  it('fetches the page through the query cache given a key, and refetches it when the key is invalidated', async () => {
    // Arrange
    renderPagination(KEY);
    await waitFor(() => expect(setContentMock).toHaveBeenCalledWith([{ id: 'a' }]));
    expect(fetchMock).toHaveBeenCalledWith(expect.objectContaining({
      page: 0,
      size: 20,
    }), false);
    fetchMock.mockResolvedValue(page([{ id: 'a' }, { id: 'b' }]));

    // Act
    await act(() => queryClient.invalidateQueries({ queryKey: ['scenario', 'scenario-1'] }));

    // Assert
    await waitFor(() => expect(setContentMock).toHaveBeenLastCalledWith([{ id: 'a' }, { id: 'b' }]));
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('fetches the page once without a key, outside of the query cache', async () => {
    // Act
    renderPagination();
    await waitFor(() => expect(setContentMock).toHaveBeenCalledWith([{ id: 'a' }]));
    await act(() => queryClient.invalidateQueries());

    // Assert
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]).toHaveLength(1);
    expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
  });
});
