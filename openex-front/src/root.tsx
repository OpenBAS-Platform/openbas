import React, { Suspense, lazy, useEffect } from 'react';
import * as R from 'ramda';
import { Navigate, Route, Routes } from 'react-router-dom';
import { StyledEngineProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { useHelper } from './store';
import { fetchMe, fetchParameters } from './actions/Application';
import NotFound from './components/NotFound';
import ConnectedThemeProvider from './components/AppThemeProvider';
import ConnectedIntlProvider from './components/AppIntlProvider';
import { errorWrapper } from './components/Error';
import { useAppDispatch } from './utils/hooks';
import type { LoggedHelper } from './actions/helper';
import Loader from './components/Loader';

const RootPublic = lazy(() => import('./public/Root'));
const IndexPrivate = lazy(() => import('./private/Index'));
const IndexAdmin = lazy(() => import('./admin/Index'));
const Comcheck = lazy(() => import('./public/components/comcheck/Comcheck'));
const Channel = lazy(() => import('./public/components/channels/Channel'));
const Challenges = lazy(() => import('./public/components/challenges/Challenges'));
const Lessons = lazy(() => import('./public/components/lessons/Lessons'));

const Root = () => {
  const logged = useHelper((helper: LoggedHelper) => helper.logged());
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchMe());
    dispatch(fetchParameters());
  }, []);
  if (R.isEmpty(logged)) {
    return <div />;
  }
  if (!logged) {
    return (
      <Suspense fallback={<Loader />}>
        <RootPublic />
      </Suspense>
    );
  }
  return (
    <StyledEngineProvider injectFirst={true}>
      <ConnectedThemeProvider>
        <CssBaseline />
        <ConnectedIntlProvider>
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route path="" element={logged.isOnlyPlayer ? <Navigate to="private" replace={true} /> : <Navigate to="admin" replace={true} />} />
              <Route path="private/*" element={errorWrapper(IndexPrivate)()} />
              <Route path="admin/*" element={errorWrapper(IndexAdmin)()} />
              {/* Routes from /public/Index that need to be accessible for logged user are duplicated here */}
              <Route path="comcheck/:statusId" element={errorWrapper(Comcheck)()} />
              <Route path="channels/:exerciseId/:channelId" element={errorWrapper(Channel)()} />
              <Route path="challenges/:exerciseId" element={errorWrapper(Challenges)()} />
              <Route path="lessons/:exerciseId" element={errorWrapper(Lessons)()} />
              {/* Not found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ConnectedIntlProvider>
      </ConnectedThemeProvider>
    </StyledEngineProvider>
  );
};

export default Root;
