import { Paper, Typography } from '@mui/material';

import { useFormatter } from '../../../../../components/i18n';
import ItemStatus from '../../../../../components/ItemResult';
import { type EndpointOutput, type InjectStatusOutput, type InjectTargetWithResult } from '../../../../../utils/api-types';
import AgentTraces from './traces/AgentTraces';
import EndpointTraces from './traces/EndpointTraces';
import ExecutionTime from './traces/ExecutionTime';
import TraceMessage from './traces/TraceMessage';

interface Props {
  injectStatus?: InjectStatusOutput | null;
  endpointsMap?: Map<string, EndpointOutput>;
  target?: InjectTargetWithResult;
  canShowGlobalExecutionStatus?: boolean;
}

const InjectStatus = ({
  injectStatus = null,
  endpointsMap = new Map(),
  target,
  canShowGlobalExecutionStatus = false,
}: Props) => {
  const { t } = useFormatter();

  if (!injectStatus) {
    return (
      <Paper variant="outlined" style={{ padding: 20 }}>
        <Typography variant="body1">{t('No data available')}</Typography>
      </Paper>
    );
  }

  const isTeam = target?.targetType === 'TEAMS';
  const isPlayer = target?.targetType === 'PLAYER';
  const isAsset = target?.targetType === 'ASSETS';
  const isAgent = target?.targetType === 'AGENT';

  const tracesByAgent = injectStatus.status_traces_by_agent || [];
  const tracesByPlayer = injectStatus.status_traces_by_player || [];

  const teamPlayerIds = isTeam ? target?.children?.map(ch => ch.id) ?? [] : [];
  const teamTraces = isTeam
    ? tracesByPlayer
        .filter(t => teamPlayerIds.includes(t.player_id))
        .flatMap(t => t.player_traces)
    : [];

  const playerTraces = isPlayer
    ? tracesByPlayer.find(t => t.player_id === target?.id)?.player_traces ?? []
    : [];

  const assetTraces = isAsset
    ? tracesByAgent.filter(t => t.asset_id === target?.id)
    : [];

  const agentTrace = isAgent
    ? tracesByAgent.find(t => t.agent_id === target?.id)
    : undefined;

  return (
    <>
      <Typography variant="h4">{t('Execution logs')}</Typography>
      <Paper variant="outlined" style={{ padding: '0 20px 20px' }}>
        {canShowGlobalExecutionStatus && (
          <>
            <Typography
              variant="subtitle1"
              style={{
                paddingTop: 20,
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
              style={{ marginTop: 16 }}
              startDate={injectStatus.tracking_sent_date ?? null}
              endDate={injectStatus.tracking_end_date ?? null}
            />
          </>
        )}

        {canShowGlobalExecutionStatus && (
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

        {isTeam && teamTraces.length > 0 && (
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
            <TraceMessage traces={teamTraces} />
          </>
        )}

        {isPlayer && playerTraces.length > 0 && (
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
            <TraceMessage traces={playerTraces} />
          </>
        )}

        {isAsset && assetTraces.length > 0 && target?.id && (
          <EndpointTraces
            key={target.id}
            endpoint={endpointsMap.get(target.id)!}
            tracesByAgent={assetTraces}
          />
        )}

        {isAgent && agentTrace && (
          <AgentTraces agentStatus={agentTrace} isInitialExpanded />
        )}
      </Paper>
    </>
  );
};

export default InjectStatus;
