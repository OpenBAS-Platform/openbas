import { makeStyles } from '@mui/styles';
import { lazy } from 'react';
import { Route, Routes, useParams } from 'react-router';

import { EndpointHelper } from '../../../../../actions/assets/asset-helper';
import { fetchEndpoint } from '../../../../../actions/assets/endpoint-actions';
import Breadcrumbs from '../../../../../components/Breadcrumbs';
import { errorWrapper } from '../../../../../components/Error';
import { useFormatter } from '../../../../../components/i18n';
import Loader from '../../../../../components/Loader';
import NotFound from '../../../../../components/NotFound';
import { useHelper } from '../../../../../store';
import type { Endpoint as EndpointType } from '../../../../../utils/api-types';
import { useAppDispatch } from '../../../../../utils/hooks';
import useDataLoader from '../../../../../utils/hooks/useDataLoader';
import EndpointHeader from './EndpointHeader';

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
  },
}));

const Endpoint = lazy(() => import('./Endpoint'));

const Index = () => {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const { t } = useFormatter();
  const { endpointId } = useParams() as { endpointId: EndpointType['asset_id'] };

  // Fetching data
  const { endpoint } = useHelper((helper: EndpointHelper) => ({
    endpoint: helper.getEndpoint(endpointId),
  }));
  useDataLoader(() => {
    dispatch(fetchEndpoint(endpointId));
  });

  if (endpoint) {
    return (
      <div className={classes.root}>
        <Breadcrumbs
          variant="object"
          elements={[
            { label: t('Assets') },
            { label: t('Endpoints'), link: '/admin/assets/endpoints' },
            { label: endpoint.asset_name, current: true },
          ]}
        />
        <EndpointHeader />
        <div className="clearfix" />
        <Routes>
          <Route path="" element={errorWrapper(Endpoint)()} />
          {/* Not found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    );
  }
  return <Loader />;
};

export default Index;
