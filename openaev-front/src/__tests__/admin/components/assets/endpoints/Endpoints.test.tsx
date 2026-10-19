import { createTheme, ThemeProvider } from '@mui/material/styles';
import { QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { type SearchPaginationInput } from '../../../../../utils/api-types';
import { ASSETS_LIST_KEY, keyOfTopic } from '../../../../../utils/query/keys';
import queryClient from '../../../../../utils/query/queryClient';

interface PaginationProps {
  fetch: (input: SearchPaginationInput, notifyError?: boolean) => Promise<unknown>;
  queryKey?: readonly unknown[];
  setLoading?: (loading: boolean) => void;
  topBarButtons?: ReactNode;
}

const searchAssetsMock = vi.fn(async () => ({ data: {} }));
const paginationPropsMock = vi.fn<(props: PaginationProps) => void>();
const usePostureScoresMock = vi.fn((_scopeField: string, _ids: string[], _version?: number) => ({
  loading: false,
  scores: {},
}));
let liveUpdates = false;

vi.mock('../../../../../actions/assets/endpoint-actions', () => ({
  searchAssets: searchAssetsMock,
  bulkDeleteAssets: vi.fn(),
}));
vi.mock('../../../../../actions/executors/executor-action', () => ({ fetchExecutors: vi.fn() }));
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
    return <div>{props.topBarButtons}</div>;
  },
}));
vi.mock('../../../../../admin/components/assets/endpoints/ImportUploaderEndpoints', () => ({
  default: ({ onImported }: { onImported?: () => void }) => (
    <button type="button" aria-label="import" data-live={onImported ? 'yes' : 'no'} onClick={onImported} />
  ),
}));
vi.mock('../../../../../components/common/queryable/useQueryableWithLocalStorage', () => ({
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
vi.mock('../../../../../components/i18n', () => ({ useFormatter: () => ({ t: (s: string) => s }) }));
vi.mock('../../../../../utils/hooks', () => ({ useAppDispatch: () => vi.fn() }));
vi.mock('../../../../../utils/hooks/useDataLoader', () => ({ default: vi.fn() }));
vi.mock('../../../../../utils/hooks/useMarkingDefinitions', () => ({ default: () => [] }));
vi.mock('../../../../../admin/components/assets/usePostureScores', () => ({ default: usePostureScoresMock }));
vi.mock('../../../../../utils/permissions/permissionsContext', () => ({
  Can: ({ children }: { children: ReactNode }) => children,
  useAbility: () => ({ can: () => false }),
}));
vi.mock('../../../../../components/Breadcrumbs', () => ({ default: () => null }));
vi.mock('../../../../../components/common/ExportButton', () => ({ default: () => null }));
vi.mock('../../../../../components/common/queryable/sort/SortHeadersComponentV2', () => ({ default: () => null }));
vi.mock('../../../../../components/PaginatedListLoader', () => ({ default: () => null }));
vi.mock('../../../../../admin/components/common/ToolBar', () => ({ default: () => null }));
vi.mock('../../../../../admin/components/assets/endpoints/EndpointCreation', () => ({ default: () => null }));
vi.mock('../../../../../admin/components/assets/endpoints/AssetPopover', () => ({ default: () => null }));

// Imported after the mocks so the screen picks them up.
const { default: Endpoints } = await import('../../../../../admin/components/assets/endpoints/Endpoints');

const renderEndpoints = () => render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider theme={createTheme()}>
      <MemoryRouter>
        <Endpoints />
      </MemoryRouter>
    </ThemeProvider>
  </QueryClientProvider>,
);

const lastPaginationProps = () => paginationPropsMock.mock.calls[paginationPropsMock.mock.calls.length - 1][0];
const lastPostureVersion = () => usePostureScoresMock.mock.calls[usePostureScoresMock.mock.calls.length - 1][2];

const INPUT: SearchPaginationInput = {
  page: 0,
  size: 20,
};

describe('Endpoints', () => {
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
      renderEndpoints();
      const props = lastPaginationProps();

      // Act
      await act(() => props.fetch(INPUT));

      // Assert
      expect(props.queryKey).toBeUndefined();
      expect(props.setLoading).toBeUndefined();
      expect(props.fetch).not.toBe(searchAssetsMock);
      expect(searchAssetsMock).toHaveBeenCalledWith(INPUT);
      expect(lastPostureVersion()).toBeUndefined();
      // Disabled queries register in the cache but never run.
      expect(queryClient.getQueryCache().getAll().every(query => query.state.dataUpdateCount === 0)).toBe(true);
    });

    it('keeps the full page reload after an import', () => {
      // Act
      renderEndpoints();

      // Assert
      expect(screen.getByRole('button', { name: 'import' }).getAttribute('data-live')).toBe('no');
    });
  });

  describe('with live updates on', () => {
    beforeEach(() => {
      liveUpdates = true;
    });

    it('hands the list to the query cache under the assets key', () => {
      // Act
      renderEndpoints();
      const props = lastPaginationProps();

      // Assert
      expect(props.queryKey).toEqual(ASSETS_LIST_KEY);
      expect(props.fetch).toBe(searchAssetsMock);
      expect(props.setLoading).toBeTypeOf('function');
    });

    it('invalidates the assets key after an import', () => {
      // Arrange
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue();
      renderEndpoints();

      // Act
      fireEvent.click(screen.getByRole('button', { name: 'import' }));

      // Assert
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ASSETS_LIST_KEY });
    });

    it('refetches the posture scores when the assets topic is invalidated', async () => {
      // Arrange
      renderEndpoints();
      const before = lastPostureVersion();
      expect(before).toBe(0);

      // Act
      await act(() => queryClient.invalidateQueries({ queryKey: keyOfTopic('list:assets') }));

      // Assert
      await waitFor(() => expect(lastPostureVersion()).toBeGreaterThan(0));
    });
  });
});
