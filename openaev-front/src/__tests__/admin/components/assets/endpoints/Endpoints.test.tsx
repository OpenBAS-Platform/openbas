import '@testing-library/jest-dom/vitest';

import { TooltipProvider } from '@filigran/design-system';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { type AxiosResponse } from 'axios';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { bulkDeleteAssets, searchAssets } from '../../../../../actions/assets/endpoint-actions';
import Endpoints from '../../../../../admin/components/assets/endpoints/Endpoints';

const { stub, applyChanges, searchInput } = vi.hoisted(() => ({
  stub: (name: string) => ({ default: () => <div data-testid={name} /> }),
  applyChanges: vi.fn(),
  searchInput: {
    current: {
      page: 0,
      size: 20,
    },
  },
}));

vi.mock('../../../../../actions/assets/endpoint-actions', () => ({
  searchAssets: vi.fn(),
  bulkDeleteAssets: vi.fn(),
  importEndpoints: vi.fn(),
  createEndpointAgentlessCall: vi.fn(),
  deleteAsset: vi.fn(),
}));

vi.mock('../../../../../actions/executors/executor-action', () => ({ listExecutors: vi.fn(() => Promise.resolve({ data: [] })) }));

vi.mock('../../../../../actions/tags/tag-action', () => ({ listTags: vi.fn(() => Promise.resolve({ data: [] })) }));

vi.mock('../../../../../actions/dashboards/dashboard-action', () => ({ adHocSeries: vi.fn(() => Promise.resolve({ data: [] })) }));

vi.mock('../../../../../utils/query/liveRouterContext', () => ({ useLiveRouter: () => ({ applyChanges }) }));

vi.mock('../../../../../components/i18n', () => ({ useFormatter: () => ({ t: (value: string) => value }) }));

vi.mock('../../../../../utils/hooks/useMarkingDefinitions', () => ({ default: () => ({}) }));

vi.mock('../../../../../utils/permissions/permissionsContext', () => ({
  Can: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAbility: () => ({ can: () => true }),
}));

vi.mock(import('../../../../../utils/utils'), async importOriginal => ({
  ...(await importOriginal()),
  isFeatureEnabled: () => false,
}));

vi.mock('../../../../../components/common/queryable/useQueryableWithLocalStorage', () => ({
  useQueryableWithLocalStorage: () => ({
    queryableHelpers: {
      paginationHelpers: {},
      sortHelpers: {},
    },
    searchPaginationInput: searchInput.current,
  }),
}));

vi.mock('../../../../../components/common/queryable/pagination/PaginationToolbar', () => ({ default: ({ data }: { data?: { totalElements: number } }) => <div data-testid="toolbar">{data?.totalElements}</div> }));
vi.mock('../../../../../components/common/queryable/sort/SortHeadersComponentV2', () => stub('sort-headers'));
vi.mock('../../../../../components/Breadcrumbs', () => stub('breadcrumbs'));
vi.mock('../../../../../components/common/ExportButton', () => stub('export'));
vi.mock('../../../../../components/PaginatedListLoader', () => stub('list-loader'));
vi.mock('../../../../../admin/components/assets/endpoints/AssetPopover', () => ({
  default: ({ endpoint, onRequestUpdate, onRequestDelete }: {
    endpoint: { asset_id: string };
    onRequestUpdate: (asset: unknown) => void;
    onRequestDelete: (asset: unknown) => void;
  }) => (
    <>
      <button type="button" data-testid={`update-${endpoint.asset_id}`} onClick={() => onRequestUpdate(endpoint)} />
      <button type="button" data-testid={`delete-${endpoint.asset_id}`} onClick={() => onRequestDelete(endpoint)} />
    </>
  ),
}));
vi.mock('../../../../../admin/components/assets/endpoints/AssetActionDialogs', () => ({
  default: ({ endpoint, editing, deleting }: {
    endpoint: { asset_id: string };
    editing: boolean;
    deleting: boolean;
  }) => <div data-testid="action-dialogs" data-asset={endpoint.asset_id} data-editing={editing} data-deleting={deleting} />,
}));
vi.mock('../../../../../admin/components/assets/endpoints/EndpointCreation', () => stub('endpoint-creation'));
vi.mock('../../../../../admin/components/assets/endpoints/ImportUploaderEndpoints', () => stub('import-uploader'));
vi.mock('../../../../../admin/components/common/ToolBar', () => ({
  default: ({ handleBulkDelete, handleClearSelectedElements, numberOfSelectedElements }: {
    handleBulkDelete: () => void;
    handleClearSelectedElements: () => void;
    numberOfSelectedElements: number;
  }) => (
    <>
      <span data-testid="selected-count">{numberOfSelectedElements}</span>
      <button
        type="button"
        data-testid="bulk-delete"
        onClick={() => {
          handleClearSelectedElements();
          handleBulkDelete();
        }}
      />
    </>
  ),
}));

const response = (data: unknown) => ({ data }) as AxiosResponse;

const endpoint = (id: string, name: string) => ({
  asset_id: id,
  asset_name: name,
  asset_agents: [],
  asset_tags: [],
});

const page = (...endpoints: ReturnType<typeof endpoint>[]) => response({
  content: endpoints,
  totalElements: endpoints.length,
  totalPages: 1,
  pageable: { pageNumber: 0 },
});

const renderPage = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const tree = () => (
    <ThemeProvider theme={createTheme()}>
      <TooltipProvider>
        <QueryClientProvider client={client}>
          <MemoryRouter>
            <Endpoints />
          </MemoryRouter>
        </QueryClientProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
  const view = render(tree());
  return {
    client,
    rerenderPage: () => view.rerender(tree()),
  };
};

describe('Endpoints', () => {
  beforeEach(() => {
    vi.mocked(searchAssets).mockReset();
    vi.mocked(bulkDeleteAssets).mockReset();
    applyChanges.mockReset();
    searchInput.current = {
      page: 0,
      size: 20,
    };
  });

  afterEach(() => {
    cleanup();
  });

  it('lists the assets of the search and hands the page to the toolbar', async () => {
    // Arrange
    vi.mocked(searchAssets).mockResolvedValue(response({
      content: [endpoint('a1', 'First asset'), endpoint('a2', 'Second asset')],
      totalElements: 2,
      totalPages: 1,
      pageable: { pageNumber: 0 },
    }));

    // Act
    renderPage();

    // Assert
    expect(await screen.findByText('First asset')).toBeInTheDocument();
    expect(screen.getByText('Second asset')).toBeInTheDocument();
    expect(screen.getByTestId('toolbar')).toHaveTextContent('2');
    expect(searchAssets).toHaveBeenCalledWith({
      page: 0,
      size: 20,
    }, false);
  });

  it('shows the list loader until the first page arrives', () => {
    // Arrange
    vi.mocked(searchAssets).mockReturnValue(new Promise(() => {}));

    // Act
    renderPage();

    // Assert
    expect(screen.getByTestId('list-loader')).toBeInTheDocument();
  });

  it('announces the deletion of every asset removed by the bulk delete', async () => {
    // Arrange
    vi.mocked(searchAssets).mockResolvedValue(page(endpoint('a1', 'First asset'), endpoint('a2', 'Second asset')));
    vi.mocked(bulkDeleteAssets).mockResolvedValue(response(['a1', 'a2']));
    renderPage();
    fireEvent.click(await screen.findByRole('checkbox', { name: 'First asset' }));

    // Act
    fireEvent.click(await screen.findByTestId('bulk-delete'));

    // Assert
    await waitFor(() => expect(applyChanges).toHaveBeenCalledTimes(1));
    expect(applyChanges.mock.calls[0][0]).toEqual([
      {
        type: 'assets',
        id: 'a1',
        action: 'delete',
      },
      {
        type: 'assets',
        id: 'a2',
        action: 'delete',
      },
    ]);
    expect(vi.mocked(bulkDeleteAssets).mock.calls[0][0]).toMatchObject({ asset_ids_to_process: ['a1'] });
  });

  it('announces nothing when the bulk delete fails', async () => {
    // Arrange
    vi.mocked(searchAssets).mockResolvedValue(page(endpoint('a1', 'First asset')));
    vi.mocked(bulkDeleteAssets).mockRejectedValue({ status: 403 });
    renderPage();
    fireEvent.click(await screen.findByRole('checkbox', { name: 'First asset' }));

    // Act
    fireEvent.click(await screen.findByTestId('bulk-delete'));

    // Assert
    await waitFor(() => expect(bulkDeleteAssets).toHaveBeenCalled());
    expect(applyChanges).not.toHaveBeenCalled();
  });

  it('dims the previous rows and blocks their selection while a new page loads', async () => {
    // Arrange
    vi.mocked(searchAssets).mockResolvedValueOnce(page(endpoint('a1', 'First asset')));
    const { rerenderPage } = renderPage();
    await screen.findByText('First asset');
    expect(screen.getByRole('checkbox', { name: 'First asset' })).toBeEnabled();
    vi.mocked(searchAssets).mockReturnValue(new Promise(() => {}));

    // Act
    searchInput.current = {
      page: 1,
      size: 20,
    };
    rerenderPage();

    // Assert
    await waitFor(() => expect(screen.getByRole('checkbox', { name: 'First asset' })).toBeDisabled());
    expect(screen.getByRole('checkbox', { name: 'Select all' })).toBeDisabled();
    expect(screen.getByText('First asset').closest('ul')).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByTestId('list-loader')).not.toBeInTheDocument();
  });

  it('keeps the rows selectable once the new page has arrived', async () => {
    // Arrange
    vi.mocked(searchAssets).mockResolvedValueOnce(page(endpoint('a1', 'First asset')));
    const { rerenderPage } = renderPage();
    await screen.findByText('First asset');
    vi.mocked(searchAssets).mockResolvedValue(page(endpoint('a3', 'Third asset')));

    // Act
    searchInput.current = {
      page: 1,
      size: 20,
    };
    rerenderPage();

    // Assert
    expect(await screen.findByText('Third asset')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Third asset' })).toBeEnabled();
    expect(screen.getByText('Third asset').closest('ul')).toHaveAttribute('aria-busy', 'false');
  });

  it('runs a confirmed bulk delete while the previous rows are still shown', async () => {
    // Arrange
    vi.mocked(searchAssets).mockResolvedValueOnce(page(endpoint('a1', 'First asset')));
    vi.mocked(bulkDeleteAssets).mockResolvedValue(response(['a1']));
    const { rerenderPage } = renderPage();
    fireEvent.click(await screen.findByRole('checkbox', { name: 'First asset' }));
    const bulkDeleteButton = await screen.findByTestId('bulk-delete');
    vi.mocked(searchAssets).mockReturnValue(new Promise(() => {}));
    searchInput.current = {
      page: 1,
      size: 20,
    };
    rerenderPage();
    await waitFor(() => expect(screen.getByRole('checkbox', { name: 'Select all' })).toBeDisabled());

    // Act
    fireEvent.click(bulkDeleteButton);

    // Assert
    await waitFor(() => expect(bulkDeleteAssets).toHaveBeenCalledTimes(1));
    expect(vi.mocked(bulkDeleteAssets).mock.calls[0][0]).toMatchObject({ asset_ids_to_process: ['a1'] });
  });

  it('drops a selected row that a refetch of the same search no longer returns', async () => {
    // Arrange
    vi.mocked(searchAssets).mockResolvedValueOnce(page(endpoint('a1', 'First asset'), endpoint('a2', 'Second asset')));
    const { client } = renderPage();
    fireEvent.click(await screen.findByRole('checkbox', { name: 'First asset' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Second asset' }));
    await waitFor(() => expect(screen.getByTestId('selected-count')).toHaveTextContent('2'));
    vi.mocked(searchAssets).mockResolvedValue(page(endpoint('a2', 'Second asset')));

    // Act
    await client.invalidateQueries({ queryKey: ['assets'] });

    // Assert
    await waitFor(() => expect(screen.getByTestId('selected-count')).toHaveTextContent('1'));
  });

  it('keeps the selection made on another page when the current page is refetched', async () => {
    // Arrange
    vi.mocked(searchAssets).mockResolvedValueOnce(page(endpoint('a1', 'First asset')));
    const { client, rerenderPage } = renderPage();
    fireEvent.click(await screen.findByRole('checkbox', { name: 'First asset' }));
    vi.mocked(searchAssets).mockResolvedValue(page(endpoint('a3', 'Third asset')));
    searchInput.current = {
      page: 1,
      size: 20,
    };
    rerenderPage();
    await screen.findByText('Third asset');
    vi.mocked(searchAssets).mockResolvedValue(page(endpoint('a3', 'Third asset'), endpoint('a4', 'Fourth asset')));

    // Act
    await client.invalidateQueries({ queryKey: ['assets'] });

    // Assert
    await screen.findByText('Fourth asset');
    expect(screen.getByTestId('selected-count')).toHaveTextContent('1');
  });

  it('keeps the update drawer open when its row leaves the page', async () => {
    // Arrange
    vi.mocked(searchAssets).mockResolvedValueOnce(page(endpoint('a1', 'First asset'), endpoint('a2', 'Second asset')));
    const { client } = renderPage();
    fireEvent.click(await screen.findByTestId('update-a1'));
    expect(screen.getByTestId('action-dialogs')).toHaveAttribute('data-editing', 'true');
    vi.mocked(searchAssets).mockResolvedValue(page(endpoint('a2', 'Second asset')));

    // Act
    await client.invalidateQueries({ queryKey: ['assets'] });

    // Assert
    await waitFor(() => expect(screen.queryByText('First asset')).not.toBeInTheDocument());
    expect(screen.getByTestId('action-dialogs')).toHaveAttribute('data-asset', 'a1');
    expect(screen.getByTestId('action-dialogs')).toHaveAttribute('data-editing', 'true');
  });

  it('opens the delete dialog for the chosen row', async () => {
    // Arrange
    vi.mocked(searchAssets).mockResolvedValueOnce(page(endpoint('a1', 'First asset'), endpoint('a2', 'Second asset')));
    renderPage();

    // Act
    fireEvent.click(await screen.findByTestId('delete-a2'));

    // Assert
    expect(screen.getByTestId('action-dialogs')).toHaveAttribute('data-asset', 'a2');
    expect(screen.getByTestId('action-dialogs')).toHaveAttribute('data-deleting', 'true');
  });
});
