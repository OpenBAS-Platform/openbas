import { Paper, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

import { getInjectTracesFromInjectAndTarget } from '../../../../../actions/injects/inject-action';
import { useFormatter } from '../../../../../components/i18n';
import Loader from '../../../../../components/Loader';
import { type ExecutionTraceOutput, type InjectTargetWithResult } from '../../../../../utils/api-types';
import AgentTraces from './traces/AgentTraces';
import EndpointTraces from './traces/EndpointTraces';
import TraceMessage from './traces/TraceMessage';

interface Props {
  injectId: string;
  target?: InjectTargetWithResult;
}

const ExecutionStatusDetail = ({ injectId, target }: Props) => {
  const { t } = useFormatter();
  const [traces, setTraces] = useState<ExecutionTraceOutput[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const isTeam = target?.targetType === 'TEAMS';
  const isPlayer = target?.targetType === 'PLAYER';
  const isAsset = target?.targetType === 'ASSETS';
  const isAgent = target?.targetType === 'AGENT';

  useEffect(() => {
    const fetchTraces = async () => {
      if (!target?.id || !target.targetType) return;
      setLoading(true);
      try {
        const result = await getInjectTracesFromInjectAndTarget(injectId, target.id, target.targetType);
        setTraces(result.data || []);
      } finally {
        setLoading(false);
      }
    };

    fetchTraces();
  }, [injectId, target]);

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      {traces.length > 0 && <Typography variant="h4">{t('Execution logs')}</Typography>}
      <Paper variant="outlined" style={{ padding: '0 20px 20px' }}>
        {!loading && (
          <>
            {(isTeam || isPlayer) && (
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
                <TraceMessage traces={traces} />
              </>
            )}

            {isAsset && target?.id && target.id && (
              <EndpointTraces key={target.id} endpoint={target} tracesByAgent={traces} />
            )}

            {isAgent && traces.length > 0 && (
              <AgentTraces traces={traces} isInitialExpanded />
            )}
          </>
        )}
      </Paper>
    </>
  )
  ;
};

export default ExecutionStatusDetail;
