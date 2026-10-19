import { QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { type SearchPaginationInput } from '../../../../../utils/api-types';
import { CREDENTIALS_LIST_KEY } from '../../../../../utils/query/keys';
import queryClient from '../../../../../utils/query/queryClient';

interface PaginationProps {
  fetch: (input: SearchPaginationInput, notifyError?: boolean) => Promise<unknown>;
  queryKey?: readonly unknown[];
  setLoading?: (loading: boolean) => void;
  topBarButtons?: ReactNode;
}

const searchCredentialsMock = vi.fn(async () => ({ data: {} }));
const paginationPropsMock = vi.fn<(props: PaginationProps) => void>();
let liveUpdates = false;

vi.mock('../../../../../actions/assets/credential-actions', () => ({
  searchCredentials: searchCredentialsMock,
  fetchCredential: vi.fn(),
  bulkDeleteCredentials: vi.fn(),
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
    return <div>{props.topBarButtons}</div>;
  },
}));
vi.mock('../../../../../admin/components/assets/credentials/CredentialCreation', () => ({
  default: ({ onCreate }: { onCreate: (credential: unknown) => void }) => (
    <button type="button" aria-label="create" onClick={() => onCreate({ credential_id: 'new' })} />
  ),
}));
vi.mock('../../../../../components/common/queryable/useQueryableWithLocalStorage', () => ({
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
vi.mock('../../../../../components/i18n', () => ({
  useFormatter: () => ({
    t: (s: string) => s,
    fldt: (s: string) => s,
  }),
}));
vi.mock('../../../../../utils/permissions/permissionsContext', () => ({
  Can: ({ children }: { children: ReactNode }) => children,
  useAbility: () => ({ can: () => false }),
}));
vi.mock('../../../../../components/Breadcrumbs', () => ({ default: () => null }));
vi.mock('../../../../../components/Empty', () => ({ default: () => null }));
vi.mock('../../../../../components/common/queryable/sort/SortHeadersComponentV2', () => ({ default: () => null }));
vi.mock('../../../../../components/PaginatedListLoader', () => ({ default: () => null }));
vi.mock('../../../../../admin/components/common/ToolBar', () => ({ default: () => null }));
vi.mock('../../../../../admin/components/assets/credentials/CredentialPopover', () => ({ default: () => null }));
vi.mock('../../../../../admin/components/assets/credentials/CredentialStatusChip', () => ({ default: () => null }));
vi.mock('../../../../../admin/components/assets/AssetCategoryIcon', () => ({ default: () => null }));
vi.mock('../../../../../components/ItemTags', () => ({ default: () => null }));

// Imported after the mocks so the screen picks them up.
const { default: Credentials } = await import('../../../../../admin/components/assets/credentials/Credentials');

const renderCredentials = () => render(
  <QueryClientProvider client={queryClient}>
    <MemoryRouter>
      <Credentials />
    </MemoryRouter>
  </QueryClientProvider>,
);

const lastPaginationProps = () => paginationPropsMock.mock.calls[paginationPropsMock.mock.calls.length - 1][0];

const INPUT: SearchPaginationInput = {
  page: 0,
  size: 20,
};

describe('Credentials', () => {
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
      const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
      renderCredentials();
      const props = lastPaginationProps();

      // Act
      await act(() => props.fetch(INPUT));
      fireEvent.click(screen.getByRole('button', { name: 'create' }));

      // Assert
      expect(props.queryKey).toBeUndefined();
      expect(props.setLoading).toBeUndefined();
      expect(props.fetch).not.toBe(searchCredentialsMock);
      expect(searchCredentialsMock).toHaveBeenCalledWith(INPUT);
      expect(invalidate).not.toHaveBeenCalled();
    });
  });

  describe('with live updates on', () => {
    beforeEach(() => {
      liveUpdates = true;
    });

    it('hands the list to the query cache under the credentials key', () => {
      // Act
      renderCredentials();
      const props = lastPaginationProps();

      // Assert
      expect(props.queryKey).toEqual(CREDENTIALS_LIST_KEY);
      expect(props.fetch).toBe(searchCredentialsMock);
      expect(props.setLoading).toBeDefined();
    });

    it('invalidates the credentials key after a local creation', () => {
      // Arrange
      const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
      renderCredentials();

      // Act
      fireEvent.click(screen.getByRole('button', { name: 'create' }));

      // Assert
      expect(invalidate).toHaveBeenCalledWith({ queryKey: CREDENTIALS_LIST_KEY });
    });
  });
});
