import React, { Suspense, lazy } from 'react';
import { makeStyles } from '@mui/styles';
import { Navigate, Route, Routes } from 'react-router-dom';
import { errorWrapper } from '../../../components/Error';
import Loader from '../../../components/Loader';

const Players = lazy(() => import('./Players'));
const Teams = lazy(() => import('./Teams'));

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
          <Route path="" element={<Navigate to="players" replace={true} />} />
          <Route path="players" element={errorWrapper(Players)()} />
          <Route path="teams" element={errorWrapper(Teams)()} />
        </Routes>
      </Suspense>
    </div>
  );
};

export default Index;
