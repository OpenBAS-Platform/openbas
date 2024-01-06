import React, { Suspense, lazy } from 'react';
import { makeStyles } from '@mui/styles';
import { Navigate, Route, Routes } from 'react-router-dom';
import { errorWrapper } from '../../../components/Error';
import Loader from '../../../components/Loader';

const Channels = lazy(() => import('./Channels'));
const IndexChannel = lazy(() => import('./channels/Index'));
const Documents = lazy(() => import('./Documents'));

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
          <Route path="" element={<Navigate to="channels" replace={true} />} />
          <Route path="channels" element={errorWrapper(Channels)()} />
          <Route path="channels/:channelId/*" element={errorWrapper(IndexChannel)()} />
          <Route path="documents" element={errorWrapper(Documents)()} />
        </Routes>
      </Suspense>
    </div>
  );
};

export default Index;
