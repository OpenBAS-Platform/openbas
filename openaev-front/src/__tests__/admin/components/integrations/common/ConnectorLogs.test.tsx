import { createTheme, ThemeProvider } from '@mui/material/styles';
import { QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { keyOfTopic } from '../../../../../utils/query/keys';
import queryClient from '../../../../../utils/query/queryClient';

const INSTANCE_ID = 'instance-1';

const logsPage = (...lines: string[]) => ({
  data: {
    content: lines.map((line, index) => ({
      connector_instance_log_id: `log-${index}`,
      connector_instance_log: line,
      connector_instance_log_created_at: '2026-10-16T10:00:00Z',
    })),
    totalElements: lines.length,
    totalPages: 1,
  },
});

const searchConnectorInstanceLogsMock = vi.fn();
let liveUpdates = false;

vi.mock('../../../../../actions/connector_instances/connector-instance-actions', () => ({ searchConnectorInstanceLogs: searchConnectorInstanceLogsMock }));
vi.mock('../../../../../utils/utils', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const original = await importOriginal<typeof import('../../../../../utils/utils')>();
  return {
    ...original,
    isFeatureEnabled: (feature: string) => feature === 'STREAM_INVALIDATION' && liveUpdates,
  };
});
vi.mock('../../../../../utils/error/errorHandlerUtil', () => ({ notifyErrorHandler: vi.fn() }));
vi.mock('../../../../../components/i18n', () => ({
  useFormatter: () => ({
    t: (s: string) => s,
    fldt: (s: string) => s,
  }),
}));
vi.mock('../../../../../components/common/terminal/Terminal', () => ({
  default: ({ lines }: {
    lines: {
      key: string;
      content: string;
    }[];
  }) => lines.map(line => <p key={line.key}>{line.content}</p>),
}));

// Imported after the mocks so the component picks them up.
const { default: ConnectorLogs } = await import('../../../../../admin/components/integrations/common/ConnectorLogs');

const renderLogs = () => render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider theme={createTheme()}>
      <ConnectorLogs connectorInstanceId={INSTANCE_ID} />
    </ThemeProvider>
  </QueryClientProvider>,
);

const invalidateIntegrationsTopic = () => act(() => queryClient.invalidateQueries({ queryKey: keyOfTopic('list:integrations') }));

describe('ConnectorLogs', () => {
  afterEach(() => {
    cleanup();
    queryClient.clear();
    vi.clearAllMocks();
  });

  describe('with live updates off', () => {
    beforeEach(() => {
      liveUpdates = false;
    });

    it('loads the logs once, outside the query cache', async () => {
      // Arrange
      searchConnectorInstanceLogsMock.mockResolvedValue(logsPage('started'));
      renderLogs();
      expect(await screen.findByText('started')).toBeDefined();

      // Act
      await invalidateIntegrationsTopic();

      // Assert
      expect(searchConnectorInstanceLogsMock).toHaveBeenCalledTimes(1);
      expect(searchConnectorInstanceLogsMock).toHaveBeenCalledWith(INSTANCE_ID, expect.objectContaining({ page: 0 }));
      expect(queryClient.getQueryCache().getAll().every(query => query.state.dataUpdateCount === 0)).toBe(true);
    });
  });

  describe('with live updates on', () => {
    beforeEach(() => {
      liveUpdates = true;
    });

    it('refetches the logs when the integrations topic is invalidated', async () => {
      // Arrange
      searchConnectorInstanceLogsMock
        .mockResolvedValueOnce(logsPage('started'))
        .mockResolvedValueOnce(logsPage('started', 'collected 3 assets'));
      renderLogs();
      expect(await screen.findByText('started')).toBeDefined();

      // Act
      await invalidateIntegrationsTopic();

      // Assert
      expect(await screen.findByText('collected 3 assets')).toBeDefined();
      expect(searchConnectorInstanceLogsMock).toHaveBeenCalledTimes(2);
      // Errors are notified once by the query, not by each attempt.
      expect(searchConnectorInstanceLogsMock).toHaveBeenCalledWith(INSTANCE_ID, expect.objectContaining({ page: 0 }), false);
    });
  });
});
