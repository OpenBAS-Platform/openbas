import { QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { reportKey } from '../../../../utils/query/keys';
import queryClient from '../../../../utils/query/queryClient';

const REPORTING_ID = 'reporting-1';
const GENERATION_ID = 'generation-1';

const fetchReportingGenerationMock = vi.fn<(generationId: string, notifyError?: boolean) => Promise<unknown>>();

vi.mock('../../../../actions/reporting/reporting-actions', () => ({ fetchReportingGeneration: fetchReportingGenerationMock }));

// Imported after the mocks so the hook picks them up.
const {
  GENERATION_POLL_INTERVAL_MS,
  GENERATION_POLL_TIMEOUT_MS,
  useGenerationProgress,
} = await import('../../../../admin/components/reporting/reportingQueries');

const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;

const status = (value: string, error?: string) => ({
  data: {
    reporting_generation_id: GENERATION_ID,
    reporting_generation_status: value,
    reporting_generation_error: error,
  },
});

const callbacks = () => ({
  onSuccess: vi.fn(),
  onFailure: vi.fn(),
  onTimeout: vi.fn(),
});

describe('useGenerationProgress', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    queryClient.clear();
    vi.clearAllMocks();
  });

  it('polls the generation while it runs, then reports its success once and stops', async () => {
    // Arrange
    fetchReportingGenerationMock.mockResolvedValue(status('RUNNING'));
    const handlers = callbacks();
    renderHook(() => useGenerationProgress(REPORTING_ID, GENERATION_ID, handlers), { wrapper });
    await act(() => vi.advanceTimersByTimeAsync(0));
    fetchReportingGenerationMock.mockResolvedValue(status('SUCCESS'));

    // Act
    await act(() => vi.advanceTimersByTimeAsync(GENERATION_POLL_INTERVAL_MS));
    await act(() => vi.advanceTimersByTimeAsync(GENERATION_POLL_INTERVAL_MS * 4));

    // Assert
    expect(fetchReportingGenerationMock).toHaveBeenCalledTimes(2);
    expect(fetchReportingGenerationMock).toHaveBeenCalledWith(GENERATION_ID, false);
    expect(handlers.onSuccess).toHaveBeenCalledTimes(1);
    expect(handlers.onFailure).not.toHaveBeenCalled();
    expect(queryClient.getQueryCache().find({
      queryKey: reportKey(REPORTING_ID),
      exact: false,
    })).toBeDefined();
  });

  it('reports a failure with the generation error', async () => {
    // Arrange
    fetchReportingGenerationMock.mockResolvedValue(status('ERROR', 'Boom'));
    const handlers = callbacks();

    // Act
    renderHook(() => useGenerationProgress(REPORTING_ID, GENERATION_ID, handlers), { wrapper });
    await act(() => vi.advanceTimersByTimeAsync(0));

    // Assert
    expect(handlers.onFailure).toHaveBeenCalledWith('Boom');
  });

  it('gives up after the timeout when the generation never ends', async () => {
    // Arrange
    fetchReportingGenerationMock.mockResolvedValue(status('RUNNING'));
    const handlers = callbacks();
    renderHook(() => useGenerationProgress(REPORTING_ID, GENERATION_ID, handlers), { wrapper });

    // Act
    await act(() => vi.advanceTimersByTimeAsync(GENERATION_POLL_TIMEOUT_MS));

    // Assert
    expect(handlers.onTimeout).toHaveBeenCalledTimes(1);
    expect(handlers.onSuccess).not.toHaveBeenCalled();
  });

  it('follows nothing without a generation id', async () => {
    // Arrange
    const handlers = callbacks();

    // Act
    renderHook(() => useGenerationProgress(REPORTING_ID, null, handlers), { wrapper });
    await act(() => vi.advanceTimersByTimeAsync(GENERATION_POLL_TIMEOUT_MS));

    // Assert
    expect(fetchReportingGenerationMock).not.toHaveBeenCalled();
    expect(handlers.onTimeout).not.toHaveBeenCalled();
  });
});
