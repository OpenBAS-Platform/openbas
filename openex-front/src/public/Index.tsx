import React from 'react';
import * as PropTypes from 'prop-types';
import { Route, Routes } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import Comcheck from './components/comcheck/Comcheck';
import Login from './components/login/Login';
import { errorWrapper } from '../components/Error';
import Media from './components/medias/Media';
import Challenges from './components/challenges/Challenges';
import Lessons from './components/lessons/Lessons';
import Reset from './components/login/Reset';
import { Theme } from '../components/Theme';

const useStyles = makeStyles<Theme>((theme) => ({
  root: {
    minWidth: 1280,
    height: '100%',
  },
  content: {
    height: '100%',
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: 0,
    minWidth: 0,
  },
}));

const Index = () => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <main className={classes.content}>
        <Routes>
          <Route path="comcheck/:statusId" element={errorWrapper(Comcheck)()} />
          <Route path="reset" element={errorWrapper(Reset)()} />
          <Route
            path="medias/:exerciseId/:mediaId"
            element={errorWrapper(Media)()}
          />
          <Route
            path="challenges/:exerciseId"
            element={errorWrapper(Challenges)()}
          />
          <Route path="lessons/:exerciseId" element={errorWrapper(Lessons)()} />
          <Route path="*" element={<Login />} />
        </Routes>
      </main>
    </div>
  );
};

Index.propTypes = {
  classes: PropTypes.object,
};

export default Index;
