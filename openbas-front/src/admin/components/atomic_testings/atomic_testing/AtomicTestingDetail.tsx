import { Paper, Typography } from '@mui/material';
import { type FunctionComponent, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';

import { getInjectStatusWithGlobalExecutionTraces } from '../../../../actions/injects/inject-action';
import { useFormatter } from '../../../../components/i18n';
import ItemStatus from '../../../../components/ItemResult';
import Loader from '../../../../components/Loader';
import { type InjectStatusOutput } from '../../../../utils/api-types';
import ExecutionTime from '../../common/injects/status/traces/ExecutionTime';
import TraceMessage from '../../common/injects/status/traces/TraceMessage';

const AtomicTestingDetail: FunctionComponent = () => {
  const { t } = useFormatter();
  const [searchParams] = useSearchParams();
  const injectId = searchParams.get('id');

  const [injectStatus, setInjectStatus] = useState<InjectStatusOutput | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (injectId) {
      setLoading(true);
      // @ts-ignore
      getInjectStatusWithGlobalExecutionTraces(injectId)
        .then(data => setInjectStatus(data))
        .finally(() => { setLoading(false); });
    }
  }, [injectId]);

  if (loading) {
    return <Loader />;
  }

  if (!injectStatus) {
    return <Typography color="error">{t('No data available')}</Typography>;
  }

  return (
    <>
      <Typography variant="h4">{t('Execution logs')}</Typography>
      <Paper variant="outlined" style={{ padding: '0 20px 20px' }}>
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
        <TraceMessage traces={injectStatus.status_main_traces ?? []} />
      </Paper>
    </>
  );
};
export default AtomicTestingDetail;
