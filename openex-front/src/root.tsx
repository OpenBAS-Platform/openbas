import React, { useEffect } from 'react';
import * as R from 'ramda';
import { Navigate, Route, Routes } from 'react-router-dom';
import { StyledEngineProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import RootPublic from './public/Root';
import IndexAdmin from './admin/Index';
import IndexPrivate from './private/Index';
import { useHelper } from './store';
import { fetchMe, fetchParameters } from './actions/Application';
import NotFound from './components/NotFound';
import ConnectedThemeProvider from './components/AppThemeProvider';
import ConnectedIntlProvider from './components/AppIntlProvider';
import { errorWrapper } from './components/Error';
import { useAppDispatch } from './utils/hooks';
import Comcheck from './public/components/comcheck/Comcheck';
import Media from './public/components/medias/Media';
import Challenges from './public/components/challenges/Challenges';
import Lessons from './public/components/lessons/Lessons';
import { LoggedHelper } from './actions/helper';

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
    return <RootPublic />;
  }
  return (
    <StyledEngineProvider injectFirst={true}>
      <ConnectedThemeProvider>
        <CssBaseline />
        <ConnectedIntlProvider>
          <Routes>
            <Route
              path=""
              element={
                logged.isOnlyPlayer ? (
                  <Navigate to="private" />
                ) : (
                  <Navigate to="admin" />
                )
              }
            />
            <Route path="private/*" element={errorWrapper(IndexPrivate)()} />
            <Route path="admin/*" element={errorWrapper(IndexAdmin)()} />
            {/* Routes from /public/Index that need to be accessible for logged user are duplicated here */}
            <Route
              path="comcheck/:statusId"
              element={errorWrapper(Comcheck)()}
            />
            <Route
              path="medias/:exerciseId/:mediaId"
              element={errorWrapper(Media)()}
            />
            <Route
              path="challenges/:exerciseId"
              element={errorWrapper(Challenges)()}
            />
            <Route
              path="lessons/:exerciseId"
              element={errorWrapper(Lessons)()}
            />
            {/* Not found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ConnectedIntlProvider>
      </ConnectedThemeProvider>
    </StyledEngineProvider>
  );
};

export default Root;
