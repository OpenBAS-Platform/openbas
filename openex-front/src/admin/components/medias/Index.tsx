import React from 'react';
import { Route, Routes, useParams } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import { fetchMedia } from '../../../actions/Media';
import Loader from '../../../components/Loader';
import TopBar from '../nav/TopBar';
import Media from './Media';
import MediaHeader from './MediaHeader';
import { errorWrapper } from '../../../components/Error';
import useDataLoader from '../../../utils/ServerSideEvent';
import { useHelper } from '../../../store';
import { useAppDispatch } from '../../../utils/hooks';
import { MediasHelper } from '../../../actions/helper';

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
  },
}));

const Index = () => {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const { mediaId } = useParams();
  const { media } = useHelper((helper: MediasHelper) => ({
    media: helper.getMedia(mediaId),
  }));
  useDataLoader(() => {
    dispatch(fetchMedia(mediaId));
  });
  if (media) {
    return (
      <div className={classes.root}>
        <TopBar />
        <MediaHeader />
        <div className="clearfix" />
        <Routes>
          <Route path="" element={errorWrapper(Media)()} />
        </Routes>
      </div>
    );
  }
  return (
    <div className={classes.root}>
      <TopBar />
      <Loader />
    </div>
  );
};

export default Index;
