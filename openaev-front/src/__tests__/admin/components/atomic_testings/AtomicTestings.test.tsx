import { createTheme, ThemeProvider } from '@mui/material/styles';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { type InjectResultOutput, type SearchPaginationInput } from '../../../../utils/api-types';
import { ATOMIC_TESTINGS_LIST_KEY } from '../../../../utils/query/keys';
import queryClient from '../../../../utils/query/queryClient';

interface PaginationProps {
  fetch: (input: SearchPaginationInput, notifyError?: boolean) => Promise<unknown>;
  queryKey?: readonly unknown[];
  setLoading?: (loading: boolean) => void;
  setContent: (content: InjectResultOutput[]) => void;
  reloadContentCount?: number;
}

const searchAtomicTestingsMock = vi.fn(async () => ({ data: {} }));
const importAtomicTestingMock = vi.fn(async () => ({ data: {} }));
const paginationPropsMock = vi.fn<(props: PaginationProps) => void>();
let liveUpdates = false;

vi.mock('../../../../actions/atomic_testings/atomic-testing-actions', () => ({
  searchAtomicTestings: searchAtomicTestingsMock,
  importAtomicTesting: importAtomicTestingMock,
  bulkDeleteAtomicTestings: vi.fn(),
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
vi.mock('../../../../admin/components/common/injects/InjectImportJsonDialog', () => ({
  default: ({ handleSubmit }: { handleSubmit: (values: { file: File }) => void }) => (
    <button type="button" aria-label="import" onClick={() => handleSubmit({ file: new File(['{}'], 'atomic.json') })} />
  ),
}));
vi.mock('../../../../admin/components/atomic_testings/atomic_testing/AtomicTestingPopover', () => ({
  default: ({ atomic, onDelete }: {
    atomic: InjectResultOutput;
    onDelete: (injectId: string) => void;
  }) => (
    <button type="button" aria-label={`delete ${atomic.inject_id}`} onClick={() => onDelete(atomic.inject_id)} />
  ),
}));
vi.mock('../../../../components/common/queryable/useQueryableWithLocalStorage', () => ({
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
vi.mock('../../../../components/i18n', () => ({
  useFormatter: () => ({
    t: (s: string) => s,
    tPick: () => '',
    fldt: (s: string) => s,
    nsdt: (s: string) => s,
  }),
}));
vi.mock('../../../../utils/permissions/permissionsContext', () => ({
  Can: () => null,
  useAbility: () => ({ can: () => false }),
}));
vi.mock('../../../../components/Breadcrumbs', () => ({ default: () => null }));
vi.mock('../../../../components/common/ButtonCreate', () => ({ default: () => null }));
vi.mock('../../../../components/common/queryable/sort/SortHeadersComponentV2', () => ({ default: () => null }));
vi.mock('../../../../components/PaginatedListLoader', () => ({ default: () => null }));
vi.mock('../../../../components/Empty', () => ({ default: () => null }));
vi.mock('../../../../components/ItemDomains', () => ({ default: () => null }));
vi.mock('../../../../components/ItemStatus', () => ({ default: () => null }));
vi.mock('../../../../components/ItemTargets', () => ({ default: () => null }));
vi.mock('../../../../admin/components/common/injects/InjectIcon', () => ({ default: () => null }));
vi.mock('../../../../admin/components/common/injects/InjectorContract', () => ({ default: () => null }));
vi.mock('../../../../admin/components/common/injects/status/InjectStatus', () => ({ default: () => null }));
vi.mock('../../../../admin/components/common/ToolBar', () => ({ default: () => null }));
vi.mock('../../../../admin/components/payloads/PayloadDeprecatedChip', () => ({ default: () => null }));
vi.mock('../../../../admin/components/atomic_testings/atomic_testing/AtomicTestingResult', () => ({ default: () => null }));

// Imported after the mocks so the screen picks them up.
const { default: AtomicTestings } = await import('../../../../admin/components/atomic_testings/AtomicTestings');

const renderAtomicTestings = () => render(
  <ThemeProvider theme={createTheme()}>
    <MemoryRouter>
      <AtomicTestings />
    </MemoryRouter>
  </ThemeProvider>,
);

const lastPaginationProps = () => paginationPropsMock.mock.calls[paginationPropsMock.mock.calls.length - 1][0];

const INPUT: SearchPaginationInput = {
  page: 0,
  size: 20,
};

const ROW = {
  inject_id: 'inject-1',
  inject_title: 'Atomic testing 1',
} as InjectResultOutput;

describe('AtomicTestings', () => {
  beforeEach(() => {
    vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('with live updates off', () => {
    beforeEach(() => {
      liveUpdates = false;
    });

    it('fetches through its own loading wrapper, without a query key', async () => {
      // Arrange
      renderAtomicTestings();
      const props = lastPaginationProps();

      // Act
      await act(() => props.fetch(INPUT));

      // Assert
      expect(props.queryKey).toBeUndefined();
      expect(props.setLoading).toBeUndefined();
      expect(props.fetch).not.toBe(searchAtomicTestingsMock);
      expect(searchAtomicTestingsMock).toHaveBeenCalledWith(INPUT);
    });

    it('reloads the list after an import through the reload count', async () => {
      // Arrange
      renderAtomicTestings();
      expect(lastPaginationProps().reloadContentCount).toBe(0);

      // Act
      await act(async () => fireEvent.click(screen.getByRole('button', { name: 'import' })));

      // Assert
      expect(importAtomicTestingMock).toHaveBeenCalled();
      expect(lastPaginationProps().reloadContentCount).toBe(1);
      expect(queryClient.invalidateQueries).not.toHaveBeenCalled();
    });
  });

  describe('with live updates on', () => {
    beforeEach(() => {
      liveUpdates = true;
    });

    it('hands the list to the query cache under the atomic testings key', () => {
      // Act
      renderAtomicTestings();
      const props = lastPaginationProps();

      // Assert
      expect(props.queryKey).toEqual(ATOMIC_TESTINGS_LIST_KEY);
      expect(props.fetch).toBe(searchAtomicTestingsMock);
      expect(props.setLoading).toBeTypeOf('function');
    });

    it('refreshes the list after an import by invalidating its key', async () => {
      // Arrange
      renderAtomicTestings();

      // Act
      await act(async () => fireEvent.click(screen.getByRole('button', { name: 'import' })));

      // Assert
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ATOMIC_TESTINGS_LIST_KEY });
      expect(lastPaginationProps().reloadContentCount).toBe(0);
    });

    it('refreshes the list after a row is deleted by invalidating its key', () => {
      // Arrange
      renderAtomicTestings();
      const props = lastPaginationProps();
      act(() => {
        props.setLoading?.(false);
        props.setContent([ROW]);
      });

      // Act
      fireEvent.click(screen.getByRole('button', { name: 'delete inject-1' }));

      // Assert
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ATOMIC_TESTINGS_LIST_KEY });
      // The row stays until the refetch returns the new page.
      expect(screen.getByRole('button', { name: 'delete inject-1' })).toBeDefined();
    });
  });
});
