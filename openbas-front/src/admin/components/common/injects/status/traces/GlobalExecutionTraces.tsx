import { Paper, Typography } from '@mui/material';
import { type FunctionComponent } from 'react';

import { useFormatter } from '../../../../../../components/i18n';
import ItemStatus from '../../../../../../components/ItemStatus';
import { type InjectStatusOutput } from '../../../../../../utils/api-types';
import ExecutionTime from './ExecutionTime';
import MainTraces from './MainTraces';

type Props = { injectStatus: InjectStatusOutput };

const GlobalExecutionTraces: FunctionComponent<Props> = ({ injectStatus }) => {
  const { t } = useFormatter();

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
        <MainTraces traces={injectStatus.status_main_traces} />
      </Paper>
    </>
  );
};

export default GlobalExecutionTraces;
