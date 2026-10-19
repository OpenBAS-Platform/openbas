import '@testing-library/jest-dom/vitest';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useContext } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import InjectExpectationContext from '../../../../../../admin/components/atomic_testings/atomic_testing/context/InjectExpectationContext';
import { InjectResultOverviewOutputContext } from '../../../../../../admin/components/atomic_testings/InjectResultOverviewOutputContext';
import { type InjectExpectationsStore } from '../../../../../../admin/components/common/injects/expectations/Expectation';
import { type InjectResultOverviewOutput } from '../../../../../../utils/api-types';
import { atomicTestingKey } from '../../../../../../utils/query/keys';

const INJECT_ID = 'inject-1';

const fetchOverviewMock = vi.fn<(injectId: string) => Promise<{ data: InjectResultOverviewOutput }>>();
const deleteResultMock = vi.fn<(expectationId: string, sourceId: string) => Promise<void>>();
const updateOverviewMock = vi.fn<(overview: InjectResultOverviewOutput) => void>();
let liveUpdates = false;

vi.mock('../../../../../../actions/atomic_testings/atomic-testing-actions', () => ({ fetchInjectResultOverviewOutput: fetchOverviewMock }));
vi.mock('../../../../../../actions/Exercise', () => ({ deleteInjectExpectationResult: deleteResultMock }));
// The delete action is a thunk in the app: here it already returns the promise the dispatch would.
vi.mock('../../../../../../utils/hooks', () => ({ useAppDispatch: () => (result: Promise<void>) => result }));
vi.mock('../../../../../../utils/utils', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const original = await importOriginal<typeof import('../../../../../../utils/utils')>();
  return {
    ...original,
    isFeatureEnabled: (feature: string) => feature === 'STREAM_INVALIDATION' && liveUpdates,
  };
});
vi.mock('../../../../../../components/i18n', () => ({ useFormatter: () => ({ t: (s: string) => s }) }));
vi.mock('../../../../../../admin/components/atomic_testings/atomic_testing/target_result/TargetResultAlertsDialog', () => ({ default: () => null }));
vi.mock('../../../../../../admin/components/atomic_testings/atomic_testing/target_result/EditInjectExpectationResultDialog', () => ({ default: ({ onUpdate }: { onUpdate: () => void }) => <button type="button" aria-label="validate" onClick={onUpdate} /> }));
vi.mock('../../../../../../components/common/DialogDelete', () => ({ default: ({ handleSubmit }: { handleSubmit: () => void }) => <button type="button" aria-label="confirm delete" onClick={handleSubmit} /> }));

// Imported after the mocks so the provider picks them up.
const { default: InjectExpectationProvider } = await import('../../../../../../admin/components/atomic_testings/atomic_testing/context/InjectExpectationProvider');

const inject = { inject_id: INJECT_ID } as InjectResultOverviewOutput;
const overview = { inject_id: INJECT_ID } as InjectResultOverviewOutput;
const expectation = {
  inject_expectation_id: 'expectation-1',
  inject_expectation_type: 'DETECTION',
  inject_expectation_results: [],
} as unknown as InjectExpectationsStore;

const ExpectationActions = () => {
  const { onOpenEditInjectExpectationResultResult, onOpenDeleteInjectExpectationResult } = useContext(InjectExpectationContext);
  return (
    <>
      <button type="button" aria-label="edit" onClick={() => onOpenEditInjectExpectationResultResult(null, expectation)} />
      <button type="button" aria-label="delete" onClick={() => onOpenDeleteInjectExpectationResult({ sourceId: 'source-1' } as never, expectation)} />
    </>
  );
};

let queryClient: QueryClient;

const renderProvider = () => render(
  <QueryClientProvider client={queryClient}>
    <InjectResultOverviewOutputContext.Provider value={{
      injectResultOverviewOutput: overview,
      updateInjectResultOverviewOutput: updateOverviewMock,
    }}
    >
      <InjectExpectationProvider inject={inject}>
        <ExpectationActions />
      </InjectExpectationProvider>
    </InjectResultOverviewOutputContext.Provider>
  </QueryClientProvider>,
);

const validateEdit = async () => {
  fireEvent.click(screen.getByRole('button', { name: 'edit' }));
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'validate' }));
  });
};

describe('InjectExpectationProvider', () => {
  beforeEach(() => {
    queryClient = new QueryClient();
    vi.spyOn(queryClient, 'invalidateQueries');
    fetchOverviewMock.mockResolvedValue({ data: overview });
    deleteResultMock.mockResolvedValue();
  });

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

    it('refreshes the overview through the context after a result is edited', async () => {
      // Arrange
      renderProvider();

      // Act
      await validateEdit();

      // Assert
      expect(fetchOverviewMock).toHaveBeenCalledWith(INJECT_ID);
      expect(updateOverviewMock).toHaveBeenCalledWith(overview);
      expect(queryClient.invalidateQueries).not.toHaveBeenCalled();
      expect(screen.queryByRole('button', { name: 'validate' })).not.toBeInTheDocument();
    });
  });

  describe('with live updates on', () => {
    beforeEach(() => {
      liveUpdates = true;
    });

    it('invalidates the atomic testing key after a result is edited, the overview included', async () => {
      // Arrange: the atomic testing screen holds its overview in the query cache.
      queryClient.setQueryData([...atomicTestingKey(INJECT_ID), 'overview'], overview);
      renderProvider();

      // Act
      await validateEdit();

      // Assert
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: atomicTestingKey(INJECT_ID) });
      expect(fetchOverviewMock).not.toHaveBeenCalled();
      expect(updateOverviewMock).not.toHaveBeenCalled();
      expect(screen.queryByRole('button', { name: 'validate' })).not.toBeInTheDocument();
    });

    it('also refreshes an overview kept outside the cache, as on the simulation inject screen', async () => {
      // Arrange
      renderProvider();

      // Act
      await validateEdit();

      // Assert
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: atomicTestingKey(INJECT_ID) });
      expect(updateOverviewMock).toHaveBeenCalledWith(overview);
    });

    it('invalidates the atomic testing key after a result is deleted', async () => {
      // Arrange
      queryClient.setQueryData([...atomicTestingKey(INJECT_ID), 'overview'], overview);
      renderProvider();
      fireEvent.click(screen.getByRole('button', { name: 'delete' }));

      // Act
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'confirm delete' }));
      });

      // Assert
      expect(deleteResultMock).toHaveBeenCalledWith('expectation-1', 'source-1');
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: atomicTestingKey(INJECT_ID) });
      expect(screen.queryByRole('button', { name: 'confirm delete' })).not.toBeInTheDocument();
    });
  });
});
