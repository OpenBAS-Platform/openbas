import { makeStyles } from '@mui/styles';
import { Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import ChannelPopover from './ChannelPopover';
import { useHelper } from '../../../../store';

const useStyles = makeStyles(() => ({
  container: {
    width: '100%',
  },
  title: {
    float: 'left',
    textTransform: 'uppercase',
  },
}));

const ChannelHeader = () => {
  const classes = useStyles();
  const { channelId } = useParams();
  const { channel, userAdmin } = useHelper((helper) => ({
    channel: helper.getChannel(channelId),
    userAdmin: helper.getMe()?.user_admin ?? false,
  }));
  return (
    <div className={classes.container}>
      <Typography
        variant="h1"
        gutterBottom={true}
        classes={{ root: classes.title }}
      >
        {channel.channel_name}
      </Typography>
      {userAdmin && <ChannelPopover channel={channel} />}
    </div>
  );
};

export default ChannelHeader;
