import { makeStyles } from '@mui/styles';
import { lazy } from 'react';

import Breadcrumbs from '../../../../../components/Breadcrumbs';
import { useFormatter } from '../../../../../components/i18n';
import EndpointHeader from './EndpointHeader';
import { Route, Routes } from 'react-router';
import { errorWrapper } from '../../../../../components/Error';
import NotFound from '../../../../../components/NotFound';

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
      <div className="clearfix" />
      <Routes>
        <Route path="" element={errorWrapper(Endpoint)()} />
        {/* Not found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default Index;
