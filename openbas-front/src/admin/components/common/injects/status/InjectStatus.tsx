import { Paper, Typography } from '@mui/material';

import { useFormatter } from '../../../../../components/i18n';
import ItemStatus from '../../../../../components/ItemStatus';
import { type EndpointOutput, type InjectStatusOutput } from '../../../../../utils/api-types';
import AgentTraces from './traces/AgentTraces';
import EndpointTraces from './traces/EndpointTraces';
import ExecutionTime from './traces/ExecutionTime';
import TraceMessage from './traces/TraceMessage';

interface Props {
  injectStatus?: InjectStatusOutput | null;
  endpointsMap?: Map<string, EndpointOutput>;
  targetId?: string;
  targetType?: string;
  canShowGlobalExecutionStatus?: boolean;
}

const InjectStatus = ({
  injectStatus = null,
  endpointsMap = new Map(),
  targetId,
  targetType,
  canShowGlobalExecutionStatus = false,
}: Props) => {
  const { t } = useFormatter();

  // Get traces for asset or agent based on type
  const tracesByAgent = injectStatus?.status_traces_by_agent || [];

  const assetTraces = tracesByAgent.filter(t => t.asset_id === targetId);
  const agentTrace = tracesByAgent.find(t => t.agent_id === targetId);

  return (
    <>
      <Typography variant="h4">{t('Execution logs')}</Typography>

      {injectStatus ? (
        <Paper variant="outlined" style={{ padding: '0 20px 20px 20px' }}>
          {canShowGlobalExecutionStatus && (
            <>
              <Typography
                variant="subtitle1"
                style={{
                  paddingTop: '20px',
                  fontWeight: 'bold',
                }}
                gutterBottom
              >
                {t('Execution status')}
              </Typography>

              {injectStatus.status_name && (
                <ItemStatus
                  isInject
                  status={injectStatus.status_name}
                  label={t(injectStatus.status_name)}
                />
              )}

              <ExecutionTime
                style={{ marginTop: '16px' }}
                startDate={injectStatus.tracking_sent_date ?? null}
                endDate={injectStatus.tracking_end_date ?? null}
              />
            </>
          )}

          {(injectStatus.status_main_traces || []).length > 0 && (
            <>
              <Typography
                variant="subtitle1"
                style={{
                  fontWeight: 'bold',
                  marginTop: 20,
                }}
                gutterBottom
              >
                {t('Traces')}
              </Typography>
              <TraceMessage traces={injectStatus.status_main_traces!} />
            </>
          )}

          {targetType === 'ASSETS' && targetId && (
            <EndpointTraces
              key={targetId}
              endpoint={endpointsMap.get(targetId) as EndpointOutput}
              tracesByAgent={assetTraces}
            />
          )}

          {targetType === 'AGENT' && agentTrace && (
            <AgentTraces agentStatus={agentTrace} isInitialExpanded />
          )}
        </Paper>
      ) : (
        <Paper variant="outlined" style={{ padding: '20px' }}>
          <Typography variant="body1">{t('No data available')}</Typography>
        </Paper>
      )}
    </>
  );
};

export default InjectStatus;
