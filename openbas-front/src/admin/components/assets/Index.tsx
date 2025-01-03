import { makeStyles } from '@mui/styles';
import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router';

import { errorWrapper } from '../../../components/Error';
import Loader from '../../../components/Loader';
import NotFound from '../../../components/NotFound';

const Endpoints = lazy(() => import('./endpoints/Endpoints'));
const IndexEndpoint = lazy(() => import('./endpoints/endpoint/Index'));
const AssetGroups = lazy(() => import('./asset_groups/AssetGroups'));
const SecurityPlatforms = lazy(() => import('./security_platforms/SecurityPlatforms'));

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
  },
}));

const Index = () => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="" element={<Navigate to="endpoints" replace={true} />} />
          <Route path="endpoints" element={errorWrapper(Endpoints)()} />
          <Route path="endpoints/:endpointId/*" element={errorWrapper(IndexEndpoint)()} />
          <Route path="asset_groups" element={errorWrapper(AssetGroups)()} />
          <Route path="security_platforms" element={errorWrapper(SecurityPlatforms)()} />
          {/* Not found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  );
};

export default Index;
