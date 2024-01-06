import React, { lazy } from 'react';
import { Route, Routes, useParams } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import { fetchChannel } from '../../../../actions/Channel';
import Loader from '../../../../components/Loader';
import TopBar from '../../nav/TopBar';
import ChannelHeader from './ChannelHeader';
import { errorWrapper } from '../../../../components/Error';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { useHelper } from '../../../../store';
import { useAppDispatch } from '../../../../utils/hooks';
import type { ChannelsHelper } from '../../../../actions/helper';

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
  },
}));

const Channel = lazy(() => import('./Channel'));

const Index = () => {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const { channelId } = useParams();
  const { channel } = useHelper((helper: ChannelsHelper) => ({
    channel: helper.getChannel(channelId),
  }));
  useDataLoader(() => {
    dispatch(fetchChannel(channelId));
  });
  if (channel) {
    return (
      <div className={classes.root}>
        <TopBar />
        <ChannelHeader />
        <div className="clearfix" />
        <Routes>
          <Route path="" element={errorWrapper(Channel)()} />
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
