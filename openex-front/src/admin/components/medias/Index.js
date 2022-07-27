import React from 'react';
import { Route, Switch, useParams } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import { useDispatch } from 'react-redux';
import { fetchMedia } from '../../../actions/Media';
import Loader from '../../../components/Loader';
import TopBar from '../nav/TopBar';
import Media from './Media';
import MediaHeader from './MediaHeader';
import { errorWrapper } from '../../../components/Error';
import useDataLoader from '../../../utils/ServerSideEvent';
import { useHelper } from '../../../store';

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
  },
}));

const Index = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { mediaId } = useParams();
  const { media } = useHelper((helper) => ({
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
        <Switch>
          <Route
            exact
            path="/admin/medias/:mediaId"
            render={errorWrapper(Media)}
          />
        </Switch>
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
