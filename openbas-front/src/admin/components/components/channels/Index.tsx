import { lazy } from 'react';
import { Route, Routes, useParams } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import { fetchChannel } from '../../../../actions/channels/channel-action';
import Loader from '../../../../components/Loader';
import ChannelHeader from './ChannelHeader';
import { errorWrapper } from '../../../../components/Error';
import useDataLoader from '../../../../utils/hooks/useDataLoader';
import { useHelper } from '../../../../store';
import { useAppDispatch } from '../../../../utils/hooks';
import type { ChannelsHelper } from '../../../../actions/channels/channel-helper';
import type { Channel as ChannelType } from '../../../../utils/api-types';
import NotFound from '../../../../components/NotFound';

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
  },
}));

const Channel = lazy(() => import('./Channel'));

const Index = () => {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const { channelId } = useParams() as { channelId: ChannelType['channel_id'] };
  const { channel } = useHelper((helper: ChannelsHelper) => ({
    channel: helper.getChannel(channelId),
  }));
  useDataLoader(() => {
    dispatch(fetchChannel(channelId));
  });
  if (channel) {
    return (
      <div className={classes.root}>
        <ChannelHeader />
        <div className="clearfix" />
        <Routes>
          <Route path="" element={errorWrapper(Channel)()} />
          {/* Not found */}
          <Route path="*" element={<NotFound/>}/>
        </Routes>
      </div>
    );
  }
  return <Loader />;
};

export default Index;
