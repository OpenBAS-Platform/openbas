import '@testing-library/jest-dom/vitest';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider, type QueryKey } from '@tanstack/react-query';
import { act, cleanup, render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { type InjectExpectationsStore } from '../../../../../../admin/components/common/injects/expectations/Expectation';
import { type InjectResultOverviewOutput, type InjectTarget } from '../../../../../../utils/api-types';
import { atomicTestingKey } from '../../../../../../utils/query/keys';

const INJECT_ID = 'inject-1';

type TargetResultFetch = (injectId: string, targetId: string, targetType: string, notifyError?: boolean) => Promise<{ data: InjectExpectationsStore[] }>;
const fetchTargetResultMock = vi.fn<TargetResultFetch>();
const fetchTargetResultQueryMock = vi.fn<TargetResultFetch>();
const executionStatusPropsMock = vi.fn<(props: { queryKey?: QueryKey }) => void>();
let liveUpdates = false;

vi.mock('../../../../../../actions/atomic_testings/atomic-testing-actions', () => ({
  fetchTargetResult: fetchTargetResultMock,
  fetchTargetResultQuery: fetchTargetResultQueryMock,
}));
vi.mock('../../../../../../actions/Collector', () => ({ fetchCollectors: vi.fn() }));
vi.mock('../../../../../../utils/hooks', () => ({ useAppDispatch: () => vi.fn() }));
vi.mock('../../../../../../utils/hooks/useDataLoader', () => ({ default: vi.fn() }));
vi.mock('../../../../../../utils/error/errorHandlerUtil', () => ({ notifyErrorHandler: vi.fn() }));
vi.mock('../../../../../../utils/utils', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const original = await importOriginal<typeof import('../../../../../../utils/utils')>();
  return {
    ...original,
    isFeatureEnabled: (feature: string) => feature === 'STREAM_INVALIDATION' && liveUpdates,
  };
});
vi.mock('../../../../../../components/i18n', () => ({ useFormatter: () => ({ t: (s: string) => s }) }));
vi.mock('../../../../../../components/common/Paper', () => ({ default: ({ children }: { children: ReactNode }) => <div>{children}</div> }));
vi.mock('../../../../../../admin/components/atomic_testings/atomic_testing/target_result/TargetResultsHeader', () => ({ default: () => null }));
vi.mock('../../../../../../admin/components/atomic_testings/atomic_testing/target_result/TargetResultsTimeline', () => ({ default: () => null }));
vi.mock('../../../../../../admin/components/atomic_testings/atomic_testing/context/InjectExpectationProvider', () => ({ default: ({ children }: { children: ReactNode }) => children }));
vi.mock('../../../../../../admin/components/atomic_testings/atomic_testing/target_result/InjectExpectationCard', () => ({ default: ({ injectExpectation }: { injectExpectation: InjectExpectationsStore }) => <p>{injectExpectation.inject_expectation_name}</p> }));
vi.mock('../../../../../../admin/components/common/injects/status/traces/TerminalViewTab', () => ({ default: () => null }));
vi.mock('../../../../../../admin/components/common/injects/status/ExecutionStatusDetail', () => ({
  default: (props: { queryKey?: QueryKey }) => {
    executionStatusPropsMock(props);
    return null;
  },
}));

// Imported after the mocks so the component picks them up.
const { default: TargetResultsDetail } = await import('../../../../../../admin/components/atomic_testings/atomic_testing/target_result/TargetResultsDetail');

const inject = {
  inject_id: INJECT_ID,
  inject_type: 'openaev_implant',
} as InjectResultOverviewOutput;

const target = {
  target_id: 'target-1',
  target_type: 'ASSETS',
  target_name: 'Endpoint 1',
} as InjectTarget;

const expectation = (id: string, name: string) => ({
  inject_expectation_id: id,
  inject_expectation_name: name,
  inject_expectation_type: 'DETECTION',
}) as InjectExpectationsStore;

let queryClient: QueryClient;

const renderDetail = () => render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider theme={createTheme()}>
      <MemoryRouter>
        <TargetResultsDetail inject={inject} target={target} isAgentless={false} />
      </MemoryRouter>
    </ThemeProvider>
  </QueryClientProvider>,
);

describe('TargetResultsDetail', () => {
  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  });

  afterEach(() => {
    cleanup();
    queryClient.clear();
    vi.clearAllMocks();
  });

  describe('with live updates off', () => {
    beforeEach(() => {
      liveUpdates = false;
      fetchTargetResultMock.mockResolvedValue({ data: [expectation('e-1', 'Detection by the EDR')] });
    });

    it('fetches the results on mount, outside the query cache', async () => {
      // Act
      renderDetail();

      // Assert
      expect(await screen.findByText('Detection by the EDR')).toBeInTheDocument();
      expect(fetchTargetResultMock).toHaveBeenCalledWith(INJECT_ID, 'target-1', 'ASSETS');
      expect(fetchTargetResultQueryMock).not.toHaveBeenCalled();
      expect(executionStatusPropsMock).toHaveBeenLastCalledWith(expect.objectContaining({ queryKey: undefined }));
    });
  });

  describe('with live updates on', () => {
    beforeEach(() => {
      liveUpdates = true;
    });

    it('refetches the results when the atomic testing key is invalidated', async () => {
      // Arrange
      fetchTargetResultQueryMock
        .mockResolvedValueOnce({ data: [expectation('e-1', 'Detection by the EDR')] })
        .mockResolvedValueOnce({
          data: [
            expectation('e-1', 'Detection by the EDR'),
            expectation('e-2', 'Detection by the SIEM'),
          ],
        });
      renderDetail();
      expect(await screen.findByText('Detection by the EDR')).toBeInTheDocument();
      expect(screen.queryByText('Detection by the SIEM')).not.toBeInTheDocument();

      // Act
      await act(() => queryClient.invalidateQueries({ queryKey: atomicTestingKey(INJECT_ID) }));

      // Assert
      expect(await screen.findByText('Detection by the SIEM')).toBeInTheDocument();
      expect(fetchTargetResultQueryMock).toHaveBeenCalledTimes(2);
      expect(fetchTargetResultQueryMock).toHaveBeenLastCalledWith(INJECT_ID, 'target-1', 'ASSETS', false);
      expect(fetchTargetResultMock).not.toHaveBeenCalled();
      expect(queryClient.getQueryData([...atomicTestingKey(INJECT_ID), 'target-result', 'target-1', 'ASSETS'])).toHaveLength(2);
    });

    it('ignores the invalidation of another atomic testing', async () => {
      // Arrange
      fetchTargetResultQueryMock.mockResolvedValue({ data: [expectation('e-1', 'Detection by the EDR')] });
      renderDetail();
      expect(await screen.findByText('Detection by the EDR')).toBeInTheDocument();

      // Act
      await act(() => queryClient.invalidateQueries({ queryKey: atomicTestingKey('inject-2') }));

      // Assert
      expect(fetchTargetResultQueryMock).toHaveBeenCalledTimes(1);
    });

    it('hands the atomic testing key to the execution traces', async () => {
      // Arrange
      fetchTargetResultQueryMock.mockResolvedValue({ data: [] });

      // Act
      renderDetail();

      // Assert
      await act(() => Promise.resolve());
      expect(executionStatusPropsMock).toHaveBeenLastCalledWith(expect.objectContaining({ queryKey: atomicTestingKey(INJECT_ID) }));
    });
  });
});
