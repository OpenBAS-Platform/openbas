import { Alert, AlertTitle, Typography } from '@mui/material';
import { useState } from 'react';
import { useParams } from 'react-router';

import { fetchPayload } from '../../../../actions/payloads/payload-actions';
import { useFormatter } from '../../../../components/i18n';
import Loader from '../../../../components/Loader';
import { type Payload as PayloadType } from '../../../../utils/api-types';
import useDataLoader from '../../../../utils/hooks/useDataLoader';
import PayloadInfoPaper from '../../atomic_testings/atomic_testing/payload_info/PayloadInfoPaper';
import CommandsInfoCard from '../../atomic_testings/atomic_testing/payload_info/CommandsInfoCard';
import OutputParserInfoCard from '../../atomic_testings/atomic_testing/payload_info/OutputParserInfoCard';
import { useTheme } from '@mui/material/styles';

const Payload = () => {
  const theme = useTheme();
  const [pristine, setPristine] = useState(true);
  const [loading, setLoading] = useState(true);
  const { t } = useFormatter();
  const { payloadId } = useParams() as { payloadId: PayloadType['payload_id'] };
  const [payload, setPayload] = useState<PayloadType>();

  // Fetching data
  useDataLoader(() => {
    setLoading(true);
    fetchPayload(payloadId).then((res) => {
      setPayload(res.data);
      setPristine(false);
      setLoading(false);
    });
  });

  // avoid to show loader if something trigger useDataLoader
  if (pristine && loading) {
    return <Loader />;
  }
  if (!loading && !payload) {
    return (
      <Alert severity="warning">
        <AlertTitle>{t('Warning')}</AlertTitle>
        {t('Payload is currently unavailable or you do not have sufficient permissions to access it.')}
      </Alert>
    );
  }
  return (
    <div style={{
      marginTop: theme.spacing(2),
      display: 'grid',
      gridTemplateColumns: 'auto',
      gap: theme.spacing(1),
    }}
    >
      <div>
        <Typography variant="h4">{t('Payload')}</Typography>
        <PayloadInfoPaper payloadOutput={payload} />
      </div>
      <div>
        <Typography variant="h4">{t('Commands')}</Typography>
        <CommandsInfoCard payloadOutput={payload} />
      </div>
      <div>
        <Typography variant="h4">{t('Output parser')}</Typography>
        <OutputParserInfoCard outputParsers={payload?.payload_output_parsers || []} />
      </div>
    </div>
  );
};
export default Payload;
