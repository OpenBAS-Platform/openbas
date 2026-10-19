import { QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { keyOfTopic } from '../../../../utils/query/keys';
import queryClient from '../../../../utils/query/queryClient';

const REPORTING_ID = 'reporting-1';

const reporting = (name: string) => ({
  reporting_id: REPORTING_ID,
  reporting_name: name,
  reporting_context_type: 'PLATFORM',
  reporting_default_format: 'PDF',
  reporting_time_range: 'LAST_30_DAYS',
  reporting_updated_at: '2026-10-01T00:00:00Z',
});

const generation = (status: string) => ({
  reporting_generation_id: 'generation-1',
  reporting_generation_status: status,
  reporting_generation_created_at: '2026-10-01T00:00:00Z',
});

interface GenerationsTabProps {
  generations: { reporting_generation_status: string }[];
  pollWhileActive?: boolean;
}

const fetchReportingMock = vi.fn<(reportingId: string, notifyError?: boolean) => Promise<unknown>>();
const fetchReportingGenerationsMock = vi.fn<(reportingId: string, notifyError?: boolean) => Promise<unknown>>();
const generationsTabPropsMock = vi.fn<(props: GenerationsTabProps) => void>();
let liveUpdates = false;

vi.mock('../../../../actions/reporting/reporting-actions', () => ({
  fetchReporting: fetchReportingMock,
  fetchReportingGenerations: fetchReportingGenerationsMock,
  fetchReportingGeneration: vi.fn(),
  generateReporting: vi.fn(),
  downloadReportingGenerationUrl: (id: string) => `/download/${id}`,
}));
vi.mock('../../../../utils/utils', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const original = await importOriginal<typeof import('../../../../utils/utils')>();
  return {
    ...original,
    isFeatureEnabled: (feature: string) => feature === 'STREAM_INVALIDATION' && liveUpdates,
  };
});
vi.mock('../../../../utils/error/errorHandlerUtil', () => ({ notifyErrorHandler: vi.fn() }));
vi.mock('../../../../utils/Environment', () => ({
  MESSAGING$: {
    notifySuccess: vi.fn(),
    notifyError: vi.fn(),
  },
}));
vi.mock('../../../../components/i18n', () => ({
  useFormatter: () => ({
    t: (s: string) => s,
    fldt: (s: string) => s,
  }),
}));
vi.mock('../../../../utils/permissions/permissionsContext', () => ({ useAbility: () => ({ can: () => false }) }));
vi.mock('../../../../components/Breadcrumbs', () => ({ default: () => null }));
vi.mock('../../../../components/Loader', () => ({ default: () => <div role="progressbar" /> }));
vi.mock('../../../../components/NotFound', () => ({ default: () => <div role="alert" aria-label="not found" /> }));
vi.mock('../../../../components/common/tabs/Tabs', () => ({ default: () => null }));
vi.mock('../../../../components/common/tabs/useRoutedTabs', () => ({
  default: () => ({
    currentTab: 'generations',
    handleChangeTab: vi.fn(),
  }),
}));
vi.mock('../../../../admin/components/reporting/ReportingFormUtils', () => ({
  REPORTING_FORMATS: ['PDF', 'HTML'],
  resolveSubjectOptions: vi.fn(async () => []),
}));
vi.mock('../../../../admin/components/reporting/ReportingFragments', () => ({ ReportingFormatFragment: () => null }));
vi.mock('../../../../admin/components/reporting/ReportingPopover', () => ({ default: () => null }));
vi.mock('../../../../admin/components/reporting/ReportingPreviewTab', () => ({ default: () => null }));
vi.mock('../../../../admin/components/reporting/ReportingSchedulesTab', () => ({ default: () => null }));
vi.mock('../../../../admin/components/reporting/ReportingGenerationsTab', () => ({
  default: (props: GenerationsTabProps) => {
    generationsTabPropsMock(props);
    return (
      <ul aria-label="generations">
        {props.generations.map(item => <li key={item.reporting_generation_status}>{item.reporting_generation_status}</li>)}
      </ul>
    );
  },
}));

// Imported after the mocks so the screen picks them up.
const { default: ReportingPage } = await import('../../../../admin/components/reporting/ReportingPage');

const renderPage = () => render(
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={[`/admin/reporting/${REPORTING_ID}/generations`]}>
      <Routes>
        <Route path="/admin/reporting/:reportingId/*" element={<ReportingPage />} />
      </Routes>
    </MemoryRouter>
  </QueryClientProvider>,
);

const invalidateReportTopic = () => act(() => queryClient.invalidateQueries({ queryKey: keyOfTopic(`report:${REPORTING_ID}`) }));
const lastGenerationsTabProps = () => generationsTabPropsMock.mock.calls[generationsTabPropsMock.mock.calls.length - 1][0];

describe('ReportingPage', () => {
  beforeEach(() => {
    fetchReportingMock.mockResolvedValue({ data: reporting('First') });
    fetchReportingGenerationsMock.mockResolvedValue({ data: [generation('SUCCESS')] });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    queryClient.clear();
    vi.clearAllMocks();
  });

  describe('with live updates off', () => {
    beforeEach(() => {
      liveUpdates = false;
    });

    it('loads the report and its generations once, outside the query cache, and lets the tab poll', async () => {
      // Act
      renderPage();

      // Assert
      expect(await screen.findByRole('heading', { name: 'First' })).toBeDefined();
      expect(await screen.findByText('SUCCESS')).toBeDefined();
      expect(fetchReportingMock).toHaveBeenCalledTimes(1);
      expect(fetchReportingMock).toHaveBeenCalledWith(REPORTING_ID);
      expect(fetchReportingGenerationsMock).toHaveBeenCalledWith(REPORTING_ID);
      expect(lastGenerationsTabProps().pollWhileActive).toBe(true);
      expect(queryClient.getQueryCache().getAll().every(query => query.state.dataUpdateCount === 0)).toBe(true);
    });
  });

  describe('with live updates on', () => {
    beforeEach(() => {
      liveUpdates = true;
    });

    it('refetches the report and its generations when its topic is invalidated', async () => {
      // Arrange
      renderPage();
      expect(await screen.findByRole('heading', { name: 'First' })).toBeDefined();
      expect(await screen.findByText('SUCCESS')).toBeDefined();
      fetchReportingMock.mockResolvedValue({ data: reporting('Renamed') });
      fetchReportingGenerationsMock.mockResolvedValue({ data: [generation('ERROR')] });

      // Act
      await invalidateReportTopic();

      // Assert
      expect(await screen.findByRole('heading', { name: 'Renamed' })).toBeDefined();
      expect(await screen.findByText('ERROR')).toBeDefined();
      expect(fetchReportingMock).toHaveBeenLastCalledWith(REPORTING_ID, false);
      expect(fetchReportingGenerationsMock).toHaveBeenLastCalledWith(REPORTING_ID, false);
      expect(lastGenerationsTabProps().pollWhileActive).toBe(false);
    });

    it('shows the not found page when the report disappears, without retrying', async () => {
      // Arrange
      renderPage();
      expect(await screen.findByRole('heading', { name: 'First' })).toBeDefined();
      fetchReportingMock.mockRejectedValue(Object.assign(new Error('Not found'), { status: 404 }));

      // Act
      await invalidateReportTopic();

      // Assert
      expect(await screen.findByRole('alert', { name: 'not found' })).toBeDefined();
      await waitFor(() => expect(fetchReportingMock).toHaveBeenCalledTimes(2));
    });

    it('polls the generations only while one is pending or running', async () => {
      // Arrange
      vi.useFakeTimers({ shouldAdvanceTime: true });
      fetchReportingGenerationsMock.mockResolvedValue({ data: [generation('RUNNING')] });
      renderPage();
      expect(await screen.findByText('RUNNING')).toBeDefined();
      fetchReportingGenerationsMock.mockResolvedValue({ data: [generation('SUCCESS')] });

      // Act: the running generation is polled and ends
      await act(() => vi.advanceTimersByTimeAsync(5_000));

      // Assert
      expect(await screen.findByText('SUCCESS')).toBeDefined();
      const callsAfterEnd = fetchReportingGenerationsMock.mock.calls.length;
      expect(callsAfterEnd).toBe(2);

      // Act: nothing runs any more, so no poll until the 60 s fallback
      await act(() => vi.advanceTimersByTimeAsync(30_000));

      // Assert
      expect(fetchReportingGenerationsMock).toHaveBeenCalledTimes(callsAfterEnd);
    });
  });
});
