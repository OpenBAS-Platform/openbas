import { makeStyles } from '@mui/styles';
import { lazy } from 'react';

import Breadcrumbs from '../../../../../components/Breadcrumbs';
import { useFormatter } from '../../../../../components/i18n';
import EndpointHeader from './EndpointHeader';

const useStyles = makeStyles(() => ({}));

const Endpoint = lazy(() => import('./Endpoint'));

const Index = () => {
  const classes = useStyles();
  const { t } = useFormatter();

  // Fetching data

  return (
    <>
      <Breadcrumbs
        variant="object"
        elements={[
          { label: t('Assets'), link: '/admin/assets/endpoints' },
          { label: t('Endpoints'), link: '/admin/assets/endpoints' },
        ]}
      />
      <EndpointHeader />
    </>
  );
};

export default Index;
