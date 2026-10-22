import '@testing-library/jest-dom/vitest';

import { TooltipProvider } from '@filigran/design-system';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { type AssetOverview, assetQueries } from '../../../../../actions/assets/asset-queries';
import { fetchAssetOverview } from '../../../../../actions/assets/endpoint-actions';
import AssetDetail from '../../../../../admin/components/assets/asset/AssetDetail';

vi.mock('../../../../../actions/assets/endpoint-actions', () => ({
  fetchAssetOverview: vi.fn(),
  fetchEndpointById: vi.fn(),
  searchAssets: vi.fn(),
  searchInjectsForAsset: vi.fn(() => new Promise(() => {})),
}));

vi.mock('../../../../../actions/findings/finding-actions', () => ({ searchDistinctFindingsOnEndpoint: vi.fn(() => new Promise(() => {})) }));

vi.mock('../../../../../actions/users/User', () => ({ searchPlayerByIdAsOption: vi.fn(() => Promise.resolve({ data: [] })) }));

vi.mock('../../../../../components/i18n', () => ({ useFormatter: () => ({ t: (value: string) => value }) }));

vi.mock(import('../../../../../utils/utils'), async importOriginal => ({
  ...(await importOriginal()),
  isFeatureEnabled: () => false,
}));

vi.mock('../../../../../utils/hooks/useMarkingDefinitions', () => ({ default: () => ({}) }));

vi.mock('../../../../../admin/components/assets/useExpectationPosture', () => ({
  default: () => ({
    loading: true,
    success: 0,
    failed: 0,
    tested: 0,
    breakdown: [],
  }),
}));

vi.mock('../../../../../components/common/queryable/useQueryableWithLocalStorage', () => ({
  useQueryableWithLocalStorage: () => ({
    queryableHelpers: {},
    searchPaginationInput: {},
  }),
}));

const { stub } = vi.hoisted(() => ({ stub: (name: string) => ({ default: () => <div data-testid={name} /> }) }));

vi.mock('../../../../../admin/components/atomic_testings/InjectResultList', () => stub('inject-result-list'));
vi.mock('../../../../../admin/components/atomic_testings/injectResultUtils', () => ({ default: vi.fn() }));
vi.mock('../../../../../admin/components/findings/FindingList', () => stub('finding-list'));
vi.mock('../../../../../admin/components/reporting/EntityReportsPanel', () => stub('reports'));
vi.mock('../../../../../admin/components/assets/ExpectationList', () => stub('expectation-list'));
vi.mock('../../../../../admin/components/assets/endpoints/AssetPopover', () => stub('asset-popover'));
vi.mock('../../../../../admin/components/assets/endpoints/endpoint/AgentList', () => stub('agent-list'));
vi.mock('../../../../../admin/components/assets/statistics/InjectsPlayedOverTimeChart', () => stub('injects-chart'));
vi.mock('../../../../../admin/components/assets/statistics/PostureScoreOverTimeChart', () => stub('posture-chart'));

const renderPage = (client = new QueryClient({ defaultOptions: { queries: { retry: false } } })) => {
  return render(
    <ThemeProvider theme={createTheme()}>
      <TooltipProvider>
        <QueryClientProvider client={client}>
          <MemoryRouter initialEntries={['/admin/assets/asset-id']}>
            <Routes>
              <Route path="/admin/assets/:assetId/*" element={<AssetDetail />} />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      </TooltipProvider>
    </ThemeProvider>,
  );
};

describe('AssetDetail', () => {
  beforeEach(() => {
    vi.mocked(fetchAssetOverview).mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it('shows the not found state with a link back to the assets when the asset is gone', async () => {
    // Arrange
    vi.mocked(fetchAssetOverview).mockRejectedValue({ status: 404 });

    // Act
    renderPage();

    // Assert
    expect(await screen.findByText('This asset does not exist or has been deleted.')).toBeInTheDocument();
    expect(screen.getAllByText('Asset not found')).not.toHaveLength(0);
    expect(screen.getByRole('link', { name: 'Back to assets' })).toHaveAttribute('href', '/admin/assets');
  });

  it('keeps the unavailable warning for a 403', async () => {
    // Arrange
    vi.mocked(fetchAssetOverview).mockRejectedValue({ status: 403 });

    // Act
    renderPage();

    // Assert
    expect(await screen.findByText('Asset is currently unavailable or you do not have sufficient permissions to access it.')).toBeInTheDocument();
    expect(screen.queryByText('This asset does not exist or has been deleted.')).not.toBeInTheDocument();
  });

  it('shows the unavailable warning for a 403 even when an earlier response is cached', async () => {
    // Arrange
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    client.setQueryData(assetQueries.detail('asset-id').queryKey, {
      asset_id: 'asset-id',
      asset_name: 'Cached asset',
      asset_agents: [],
    } as AssetOverview);
    vi.mocked(fetchAssetOverview).mockRejectedValue({ status: 403 });

    // Act
    renderPage(client);

    // Assert
    expect(await screen.findByText('Asset is currently unavailable or you do not have sufficient permissions to access it.')).toBeInTheDocument();
    expect(screen.queryByText('Cached asset')).not.toBeInTheDocument();
  });

  it('keeps the unavailable warning on a network failure', async () => {
    // Arrange
    vi.mocked(fetchAssetOverview).mockRejectedValue(false);

    // Act
    renderPage();

    // Assert
    expect(await screen.findByText('Asset is currently unavailable or you do not have sufficient permissions to access it.')).toBeInTheDocument();
    expect(screen.queryByText('This asset does not exist or has been deleted.')).not.toBeInTheDocument();
  });
});
