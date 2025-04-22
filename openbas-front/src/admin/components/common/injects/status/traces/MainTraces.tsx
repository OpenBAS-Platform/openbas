import { Typography } from '@mui/material';
import type React from 'react';

import { useFormatter } from '../../../../../../components/i18n';
import { type ExecutionTraceOutput } from '../../../../../../utils/api-types';
import TraceMessage from './TraceMessage';

interface Props { traces?: ExecutionTraceOutput[] }

const MainTraces: React.FC<Props> = ({ traces }) => {
  const { t } = useFormatter();

  if (!traces || traces.length === 0) return null;

  return (
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
      {traces && <TraceMessage traces={traces} />}
    </>
  );
};

export default MainTraces;
