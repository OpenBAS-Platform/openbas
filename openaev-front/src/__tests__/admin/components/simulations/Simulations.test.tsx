import { createTheme, ThemeProvider } from '@mui/material/styles';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { type SearchPaginationInput } from '../../../../utils/api-types';
import { SIMULATIONS_LIST_KEY } from '../../../../utils/query/keys';
import queryClient from '../../../../utils/query/queryClient';

interface PaginationProps {
  fetch: (input: SearchPaginationInput, notifyError?: boolean) => Promise<unknown>;
  queryKey?: readonly unknown[];
  setLoading?: (loading: boolean) => void;
  reloadContentCount?: number;
  topBarButtons?: ReactNode;
}

interface ListProps { globalScoresQueryKey?: readonly unknown[] }

const searchExercisesMock = vi.fn(async () => ({ data: {} }));
const paginationPropsMock = vi.fn<(props: PaginationProps) => void>();
const listPropsMock = vi.fn<(props: ListProps) => void>();
let liveUpdates = false;

vi.mock('../../../../actions/Exercise', () => ({
  searchExercises: searchExercisesMock,
  bulkDeleteExercises: vi.fn(),
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
    return <div>{props.topBarButtons}</div>;
  },
}));
vi.mock('../../../../admin/components/simulations/SimulationList', () => ({
  default: (props: ListProps) => {
    listPropsMock(props);
    return null;
  },
}));
vi.mock('../../../../admin/components/simulations/ImportUploaderExercise', () => ({ default: ({ refresh }: { refresh: () => void }) => <button type="button" aria-label="import" onClick={refresh} /> }));
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
vi.mock('../../../../components/i18n', () => ({ useFormatter: () => ({ t: (s: string) => s }) }));
vi.mock('../../../../utils/permissions/permissionsContext', () => ({
  Can: ({ children }: { children: ReactNode }) => children,
  useAbility: () => ({ can: () => false }),
}));
vi.mock('../../../../admin/components/autonomous/useAutonomousRunsIndex', () => ({ default: () => ({ bySimulation: () => undefined }) }));
vi.mock('../../../../components/Breadcrumbs', () => ({ default: () => null }));
vi.mock('../../../../components/common/ExportButton', () => ({ default: () => null }));
vi.mock('../../../../admin/components/common/ToolBar', () => ({ default: () => null }));
vi.mock('../../../../admin/components/simulations/simulation/ExerciseCreation', () => ({ default: () => null }));
vi.mock('../../../../admin/components/simulations/simulation/ExercisePopover', () => ({ default: () => null }));

// Imported after the mocks so the screen picks them up.
const { default: Simulations } = await import('../../../../admin/components/simulations/Simulations');

const renderSimulations = () => render(
  <ThemeProvider theme={createTheme()}>
    <Simulations />
  </ThemeProvider>,
);

const lastPaginationProps = () => paginationPropsMock.mock.calls[paginationPropsMock.mock.calls.length - 1][0];
const lastListProps = () => listPropsMock.mock.calls[listPropsMock.mock.calls.length - 1][0];

const INPUT: SearchPaginationInput = {
  page: 0,
  size: 20,
};

describe('Simulations', () => {
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
      renderSimulations();
      const props = lastPaginationProps();

      // Act
      await act(() => props.fetch(INPUT));

      // Assert
      expect(props.queryKey).toBeUndefined();
      expect(props.setLoading).toBeUndefined();
      expect(props.fetch).not.toBe(searchExercisesMock);
      expect(searchExercisesMock).toHaveBeenCalledWith(INPUT);
      expect(lastListProps().globalScoresQueryKey).toBeUndefined();
    });

    it('reloads the list after an import through the reload count', () => {
      // Arrange
      renderSimulations();
      expect(lastPaginationProps().reloadContentCount).toBe(0);

      // Act
      fireEvent.click(screen.getByRole('button', { name: 'import' }));

      // Assert
      expect(lastPaginationProps().reloadContentCount).toBe(1);
      expect(queryClient.invalidateQueries).not.toHaveBeenCalled();
    });
  });

  describe('with live updates on', () => {
    beforeEach(() => {
      liveUpdates = true;
    });

    it('hands the list and its global scores to the query cache under the simulations key', () => {
      // Act
      renderSimulations();
      const props = lastPaginationProps();

      // Assert
      expect(props.queryKey).toEqual(SIMULATIONS_LIST_KEY);
      expect(props.fetch).toBe(searchExercisesMock);
      expect(props.setLoading).toBeTypeOf('function');
      expect(lastListProps().globalScoresQueryKey).toEqual(SIMULATIONS_LIST_KEY);
    });

    it('refreshes the list after an import by invalidating its key', () => {
      // Arrange
      renderSimulations();

      // Act
      fireEvent.click(screen.getByRole('button', { name: 'import' }));

      // Assert
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: SIMULATIONS_LIST_KEY });
      expect(lastPaginationProps().reloadContentCount).toBe(0);
    });
  });
});
