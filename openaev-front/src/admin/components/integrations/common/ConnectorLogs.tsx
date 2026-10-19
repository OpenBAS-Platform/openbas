import { Paper } from '@filigran/design-system';
import { TablePagination } from '@mui/material';
import { keepPreviousData } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { searchConnectorInstanceLogs } from '../../../../actions/connector_instances/connector-instance-actions';
import { type Page } from '../../../../components/common/queryable/Page';
import { DEFAULT_ROWS_PER_PAGE, ROWS_PER_PAGE_OPTIONS } from '../../../../components/common/queryable/pagination/usePaginationState';
import Terminal from '../../../../components/common/terminal/Terminal';
import { useFormatter } from '../../../../components/i18n';
import { type ConnectorInstanceLog } from '../../../../utils/api-types';
import useNotifiedQuery, { FALLBACK_REFETCH_INTERVAL_MS } from '../../../../utils/query/useNotifiedQuery';
import { isFeatureEnabled } from '../../../../utils/utils';
import { connectorInstanceLogsKey } from './integrationsQueries';

type ConnectorLogsProps = { connectorInstanceId: string };

const ConnectorLogs = ({ connectorInstanceId }: ConnectorLogsProps) => {
  const { t, fldt } = useFormatter();
  // With live updates on, the page of logs is a query under the integrations key: the topic
  // 'list:integrations', a window refocus or the fallback interval reloads it. Constant for a session.
  const liveUpdates = isFeatureEnabled('STREAM_INVALIDATION');

  const [logs, setLogs] = useState<ConnectorInstanceLog[]>([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(DEFAULT_ROWS_PER_PAGE);
  const [totalElements, setTotalElements] = useState(0);

  const applyPage = (data: Page<ConnectorInstanceLog>) => {
    setLogs(data.content);
    setTotalElements(data.totalElements);
    // The current page fell past the end (logs rotated/shrank): restart
    // from the first page instead of showing a stuck empty page.
    if (page > 0 && data.totalPages <= page) {
      setPage(0);
    }
  };

  // Restart from the first page when switching to another connector instance.
  useEffect(() => {
    setPage(0);
  }, [connectorInstanceId]);

  const logsQuery = useNotifiedQuery({
    queryKey: [...connectorInstanceLogsKey(connectorInstanceId), {
      page,
      size,
    }],
    // The error toast is shown once by useNotifiedQuery, after the library's retries.
    queryFn: () => searchConnectorInstanceLogs(connectorInstanceId, {
      page,
      size,
    }, false).then((result: { data: Page<ConnectorInstanceLog> }) => result.data),
    placeholderData: keepPreviousData,
    refetchInterval: FALLBACK_REFETCH_INTERVAL_MS,
    enabled: liveUpdates && !!connectorInstanceId,
  });

  useEffect(() => {
    if (logsQuery.data && !logsQuery.isPlaceholderData) {
      applyPage(logsQuery.data);
    }
  }, [logsQuery.data, logsQuery.isPlaceholderData]);

  useEffect(() => {
    if (!liveUpdates && connectorInstanceId) {
      searchConnectorInstanceLogs(connectorInstanceId, {
        page,
        size,
      })
        .then((result: { data: Page<ConnectorInstanceLog> }) => applyPage(result.data));
    }
  }, [connectorInstanceId, page, size]);

  return (
    <Paper padding={16}>
      <TablePagination
        component="div"
        rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
        count={totalElements}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={size}
        onRowsPerPageChange={(e) => {
          setSize(parseInt(e.target.value, 10));
          setPage(0);
        }}
      />
      {logs.length > 0 ? (
        <Terminal
          maxHeight={400}
          lines={logs.map(log => ({
            key: log.connector_instance_log_id,
            date: `[${fldt(log.connector_instance_log_created_at)}]`,
            content: log.connector_instance_log,
          }))}
        />
      ) : (
        <div>{t('No log for the moment.')}</div>
      )}
    </Paper>
  );
};
export default ConnectorLogs;
