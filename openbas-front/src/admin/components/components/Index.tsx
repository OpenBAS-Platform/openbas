import React, { Suspense, lazy } from 'react';
import { makeStyles } from '@mui/styles';
import { Navigate, Route, Routes } from 'react-router-dom';
import { errorWrapper } from '../../../components/Error';
import Loader from '../../../components/Loader';
import NotFound from '../../../components/NotFound';

const IndexChannel = lazy(() => import('./channels/Index'));
const Channels = lazy(() => import('./channels/Channels'));
const Documents = lazy(() => import('./documents/Documents'));
const Challenges = lazy(() => import('./challenges/Challenges'));

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
          <Route path="" element={<Navigate to="documents" replace={true} />} />
          <Route path="documents" element={errorWrapper(Documents)()} />
          <Route path="channels" element={errorWrapper(Channels)()} />
          <Route path="channels/:channelId/*" element={errorWrapper(IndexChannel)()} />
          <Route path="challenges" element={errorWrapper(Challenges)()} />
          {/* Not found */}
          <Route path="*" element={<NotFound/>}/>
        </Routes>
      </Suspense>
    </div>
  );
};

export default Index;
