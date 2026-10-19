import { TooltipProvider } from '@filigran/design-system';
import { QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { keyOfTopic } from '../../../../utils/query/keys';
import queryClient from '../../../../utils/query/queryClient';

const CONTEXT_ID = 'simulation-1';

const reporting = (name: string) => ({
  reporting_id: 'reporting-1',
  reporting_name: name,
  reporting_context_type: 'SIMULATION',
  reporting_updated_at: '2026-10-01T00:00:00Z',
  reporting_generations: [],
});

const fetchReportingsByContextMock = vi.fn<(contextType: string, contextId?: string, notifyError?: boolean) => Promise<unknown>>();
let liveUpdates = false;

vi.mock('../../../../actions/reporting/reporting-actions', () => ({
  fetchReportingsByContext: fetchReportingsByContextMock,
  fetchReportingGeneration: vi.fn(),
  generateReporting: vi.fn(),
  createReporting: vi.fn(),
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
vi.mock('../../../../components/i18n', () => ({
  useFormatter: () => ({
    t: (s: string) => s,
    fldt: (s: string) => s,
  }),
}));
vi.mock('../../../../utils/permissions/permissionsContext', () => ({ useAbility: () => ({ can: (action: string) => action === 'ACCESS' }) }));
vi.mock('../../../../admin/components/reporting/ReportingFragments', () => ({
  ReportingFormatFragment: () => null,
  ReportingStatusChip: () => null,
}));

// Imported after the mocks so the panel picks them up.
const { default: EntityReportsPanel } = await import('../../../../admin/components/reporting/EntityReportsPanel');

const renderPanel = () => render(
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <MemoryRouter>
        <EntityReportsPanel contextType="SIMULATION" contextId={CONTEXT_ID} entityName="Simulation" />
      </MemoryRouter>
    </TooltipProvider>
  </QueryClientProvider>,
);

const openPanel = () => fireEvent.click(screen.getByRole('button', { name: 'Reports' }));

describe('EntityReportsPanel', () => {
  beforeEach(() => {
    fetchReportingsByContextMock.mockResolvedValue({ data: [reporting('First')] });
  });

  afterEach(() => {
    cleanup();
    queryClient.clear();
    vi.clearAllMocks();
  });

  describe('with live updates off', () => {
    beforeEach(() => {
      liveUpdates = false;
    });

    it('fetches the reports on open, outside the query cache', async () => {
      // Arrange
      renderPanel();

      // Act
      openPanel();

      // Assert
      expect(await screen.findByText('First')).toBeDefined();
      expect(fetchReportingsByContextMock).toHaveBeenCalledWith('SIMULATION', CONTEXT_ID);
      expect(queryClient.getQueryCache().getAll().every(query => query.state.dataUpdateCount === 0)).toBe(true);
    });
  });

  describe('with live updates on', () => {
    beforeEach(() => {
      liveUpdates = true;
    });

    it('fetches nothing while closed', () => {
      // Act
      renderPanel();

      // Assert
      expect(fetchReportingsByContextMock).not.toHaveBeenCalled();
    });

    it('refetches the open panel when the reports list topic is invalidated', async () => {
      // Arrange
      renderPanel();
      openPanel();
      expect(await screen.findByText('First')).toBeDefined();
      fetchReportingsByContextMock.mockResolvedValue({ data: [reporting('Renamed')] });

      // Act
      await act(() => queryClient.invalidateQueries({ queryKey: keyOfTopic('list:reports') }));

      // Assert
      expect(await screen.findByText('Renamed')).toBeDefined();
      expect(fetchReportingsByContextMock).toHaveBeenLastCalledWith('SIMULATION', CONTEXT_ID, false);
    });
  });
});
