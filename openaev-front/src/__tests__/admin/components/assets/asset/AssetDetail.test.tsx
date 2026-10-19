import { createTheme, ThemeProvider } from '@mui/material/styles';
import { QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { assetKey, keyOfTopic } from '../../../../../utils/query/keys';
import queryClient from '../../../../../utils/query/queryClient';

const ASSET_ID = 'asset-1';

const overview = (name: string) => ({
  asset_id: ASSET_ID,
  asset_name: name,
  asset_category: 'HOST',
  asset_agents: [],
});

const fetchAssetOverviewMock = vi.fn<(assetId: string, notifyError?: boolean) => Promise<{ data: ReturnType<typeof overview> }>>();
const searchInjectsForAssetMock = vi.fn(async () => ({ data: { totalElements: 3 } }));
const searchFindingsMock = vi.fn(async () => ({ data: { totalElements: 2 } }));
const notifyErrorHandlerMock = vi.fn();
const listQueryKeys: Record<string, readonly unknown[] | undefined> = {};
let liveUpdates = false;

vi.mock('../../../../../actions/assets/endpoint-actions', () => ({
  fetchAssetOverview: fetchAssetOverviewMock,
  searchInjectsForAsset: searchInjectsForAssetMock,
}));
vi.mock('../../../../../actions/findings/finding-actions', () => ({ searchDistinctFindingsOnEndpoint: searchFindingsMock }));
vi.mock('../../../../../actions/users/User', () => ({ fetchPlayers: vi.fn() }));
vi.mock('../../../../../utils/error/errorHandlerUtil', () => ({ notifyErrorHandler: notifyErrorHandlerMock }));
vi.mock('../../../../../utils/utils', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const original = await importOriginal<typeof import('../../../../../utils/utils')>();
  return {
    ...original,
    isFeatureEnabled: (feature: string) => feature === 'STREAM_INVALIDATION' && liveUpdates,
  };
});
vi.mock('../../../../../components/i18n', () => ({ useFormatter: () => ({ t: (s: string) => s }) }));
vi.mock('../../../../../store', () => ({ useHelper: () => ({ usersMap: {} }) }));
vi.mock('../../../../../utils/hooks', () => ({ useAppDispatch: () => vi.fn() }));
vi.mock('../../../../../utils/hooks/useDataLoader', () => ({ default: vi.fn() }));
vi.mock('../../../../../utils/hooks/useMarkingDefinitions', () => ({ default: () => [] }));
vi.mock('../../../../../components/common/queryable/useQueryableWithLocalStorage', () => ({
  useQueryableWithLocalStorage: () => ({
    queryableHelpers: {},
    searchPaginationInput: {
      page: 0,
      size: 20,
    },
  }),
}));
vi.mock('../../../../../components/common/tabs/useRoutedTabs', () => ({
  default: () => ({
    currentTab: 'overview',
    handleChangeTab: vi.fn(),
  }),
}));
vi.mock('../../../../../components/common/tabs/Tabs', () => ({ default: () => null }));
vi.mock('../../../../../components/Breadcrumbs', () => ({ default: () => null }));
vi.mock('../../../../../components/ItemTags', () => ({ default: () => null }));
vi.mock('../../../../../components/ItemCriticality', () => ({ default: () => null }));
vi.mock('../../../../../components/Loader', () => ({ default: () => <div role="progressbar" /> }));
vi.mock('../../../../../components/common/detail/EntityDetailCommon', () => ({
  DetailHero: ({ title, stats }: {
    title: string;
    stats: ReactNode;
  }) => (
    <>
      <h1>{title}</h1>
      {stats}
    </>
  ),
  HeroStat: ({ label, value }: {
    label: string;
    value: ReactNode;
  }) => <span data-testid={`stat-${label}`}>{value}</span>,
  DetailSections: ({ children }: { children: ReactNode }) => <>{children}</>,
  InformationGrid: ({ children }: { children: ReactNode }) => <>{children}</>,
  SectionBlock: ({ children }: { children: ReactNode }) => <>{children}</>,
  Field: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock('../../../../../admin/components/assets/useExpectationPosture', () => ({
  default: () => ({
    loading: false,
    success: 0,
    failed: 0,
    tested: 0,
    breakdown: [],
  }),
}));
vi.mock('../../../../../admin/components/assets/PostureScore', () => ({ default: () => null }));
vi.mock('../../../../../admin/components/reporting/EntityReportsPanel', () => ({ default: () => null }));
vi.mock('../../../../../admin/components/assets/endpoints/AssetPopover', () => ({ default: () => null }));
vi.mock('../../../../../admin/components/assets/endpoints/endpoint/AgentList', () => ({ default: () => null }));
vi.mock('../../../../../admin/components/findings/FindingList', () => ({
  default: ({ queryKey }: { queryKey?: readonly unknown[] }) => {
    listQueryKeys.findings = queryKey;
    return null;
  },
}));
vi.mock('../../../../../admin/components/assets/ExpectationList', () => ({
  default: ({ queryKey }: { queryKey?: readonly unknown[] }) => {
    listQueryKeys.expectations = queryKey;
    return null;
  },
}));
vi.mock('../../../../../admin/components/atomic_testings/InjectResultList', () => ({
  default: ({ queryKey }: { queryKey?: readonly unknown[] }) => {
    listQueryKeys.injects = queryKey;
    return null;
  },
}));

// Imported after the mocks so the screen picks them up.
const { default: AssetDetail } = await import('../../../../../admin/components/assets/asset/AssetDetail');

const renderAssetDetail = () => render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider theme={createTheme()}>
      <MemoryRouter initialEntries={[`/admin/assets/${ASSET_ID}`]}>
        <Routes>
          <Route path="/admin/assets/:assetId/*" element={<AssetDetail />} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>
  </QueryClientProvider>,
);

const UNAVAILABLE = 'Asset is currently unavailable or you do not have sufficient permissions to access it.';
const invalidateAssetTopic = () => act(() => queryClient.invalidateQueries({ queryKey: keyOfTopic(`asset:${ASSET_ID}`) }));

describe('AssetDetail', () => {
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

    it('loads the overview and its lists outside the query cache', async () => {
      // Arrange
      fetchAssetOverviewMock.mockResolvedValue({ data: overview('First') });

      // Act
      renderAssetDetail();

      // Assert
      expect(await screen.findByRole('heading', { name: 'First' })).toBeDefined();
      expect(fetchAssetOverviewMock).toHaveBeenCalledWith(ASSET_ID);
      expect(listQueryKeys.findings).toBeUndefined();
      expect(listQueryKeys.expectations).toBeUndefined();
      expect(listQueryKeys.injects).toBeUndefined();
      // Disabled queries register in the cache but never run.
      expect(queryClient.getQueryCache().getAll().every(query => query.state.dataUpdateCount === 0)).toBe(true);
    });
  });

  describe('with live updates on', () => {
    beforeEach(() => {
      liveUpdates = true;
    });

    it('puts every list of the screen under the asset key', async () => {
      // Arrange
      fetchAssetOverviewMock.mockResolvedValue({ data: overview('First') });

      // Act
      renderAssetDetail();
      expect(await screen.findByRole('heading', { name: 'First' })).toBeDefined();

      // Assert
      [listQueryKeys.findings, listQueryKeys.expectations, listQueryKeys.injects].forEach((queryKey) => {
        expect(queryKey?.slice(0, 2)).toEqual([...assetKey(ASSET_ID)]);
      });
    });

    it('refetches the overview and the hero totals when its topic is invalidated', async () => {
      // Arrange
      fetchAssetOverviewMock
        .mockResolvedValueOnce({ data: overview('First') })
        .mockResolvedValueOnce({ data: overview('Second') });
      renderAssetDetail();
      expect(await screen.findByRole('heading', { name: 'First' })).toBeDefined();
      expect((await screen.findByTestId('stat-Injects played')).textContent).toBe('3');
      const totalsBefore = searchInjectsForAssetMock.mock.calls.length;
      searchInjectsForAssetMock.mockResolvedValue({ data: { totalElements: 4 } });

      // Act
      await invalidateAssetTopic();

      // Assert
      expect(await screen.findByRole('heading', { name: 'Second' })).toBeDefined();
      expect(fetchAssetOverviewMock).toHaveBeenCalledTimes(2);
      // Errors are notified once by the screen, not by each attempt.
      expect(fetchAssetOverviewMock).toHaveBeenCalledWith(ASSET_ID, false);
      expect(searchInjectsForAssetMock.mock.calls.length).toBeGreaterThan(totalsBefore);
      expect((await screen.findByTestId('stat-Injects played')).textContent).toBe('4');
    });

    it('replaces the screen with the unavailable warning when the asset disappears', async () => {
      // Arrange
      fetchAssetOverviewMock
        .mockResolvedValueOnce({ data: overview('First') })
        .mockRejectedValueOnce({
          status: 404,
          message: 'Not found',
        });
      renderAssetDetail();
      expect(await screen.findByRole('heading', { name: 'First' })).toBeDefined();

      // Act
      await invalidateAssetTopic();

      // Assert
      expect(await screen.findByText(UNAVAILABLE)).toBeDefined();
      expect(fetchAssetOverviewMock).toHaveBeenCalledTimes(2);
      expect(notifyErrorHandlerMock).toHaveBeenCalledTimes(1);
    });
  });
});
