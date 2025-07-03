import { Alert, AlertTitle } from '@mui/material';
import { lazy, useState } from 'react';
import { Route, Routes, useParams } from 'react-router';

import { fetchPayload } from '../../../../actions/payloads/payload-actions';
import Breadcrumbs from '../../../../components/Breadcrumbs';
import { errorWrapper } from '../../../../components/Error';
import { useFormatter } from '../../../../components/i18n';
import Loader from '../../../../components/Loader';
import NotFound from '../../../../components/NotFound';
import { type Payload as PayloadType } from '../../../../utils/api-types';
import useDataLoader from '../../../../utils/hooks/useDataLoader';
import PayloadHeader from './PayloadHeader';

const Payload = lazy(() => import('./Payload'));

const Index = () => {
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
    <div>
      <div>
        <Breadcrumbs
          variant="object"
          elements={[
            {
              label: t('Payloads'),
              link: '/admin/payloads',
            },
            {
              label: payload?.payload_name ?? '',
              current: true,
            },
          ]}
        />
      </div>
      <PayloadHeader payload={payload!} />
      <Routes>
        <Route path="" element={errorWrapper(Payload)()} />
        {/* Not found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

export default Index;
