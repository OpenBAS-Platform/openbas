import { lazy, Suspense, useContext } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { makeStyles } from 'tss-react/mui';

import { errorWrapper } from '../../../components/Error';
import Loader from '../../../components/Loader';
import NotFound from '../../../components/NotFound';
import { AbilityContext } from '../../../utils/permissions/PermissionsProvider';
import ProtectedRoute from '../../../utils/permissions/ProtectedRoute';

const Endpoints = lazy(() => import('./endpoints/Endpoints'));
const IndexEndpoint = lazy(() => import('./endpoints/endpoint/Index'));
const AssetGroups = lazy(() => import('./asset_groups/AssetGroups'));
const SecurityPlatforms = lazy(() => import('./security_platforms/SecurityPlatforms'));

const useStyles = makeStyles()(() => ({ root: { flexGrow: 1 } }));

const Index = () => {
  const { classes } = useStyles();
  const ability = useContext(AbilityContext);

  return (
    <div className={classes.root}>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="" element={<Navigate to={ability.can('ACCESS', 'ASSETS') ? 'endpoints' : 'security_platforms'} replace={true} />} />
          <Route path="endpoints" element={<ProtectedRoute action="ACCESS" subject="ASSETS" Component={errorWrapper(Endpoints)()} />} />
          <Route path="endpoints/:endpointId/*" element={<ProtectedRoute action="ACCESS" subject="ASSETS" Component={errorWrapper(IndexEndpoint)()} />} />
          <Route path="asset_groups" element={<ProtectedRoute action="ACCESS" subject="ASSETS" Component={errorWrapper(AssetGroups)()} />} />
          <Route path="security_platforms" element={<ProtectedRoute action="ACCESS" subject="SECURITY_PLATFORMS" Component={errorWrapper(SecurityPlatforms)()} />} />
          {/* Not found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  );
};

export default Index;
