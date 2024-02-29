import React, { useEffect } from 'react';
import * as R from 'ramda';
import { makeStyles } from '@mui/styles';
import { Box, Autocomplete, TextField, Chip } from '@mui/material';
import { useDispatch } from 'react-redux';
import { fetchChannels } from '../../../../actions/channels/channel-action';
import { useFormatter } from '../../../../components/i18n';
import { useHelper } from '../../../../store';
import ChannelIcon from './ChannelIcon';

const useStyles = makeStyles(() => ({
  icon: {
    paddingTop: 4,
    display: 'inline-block',
  },
  text: {
    display: 'inline-block',
    flexGrow: 1,
    marginLeft: 10,
  },
  filters: {
    float: 'left',
    margin: '5px 0 0 15px',
  },
  filter: {
    marginRight: 10,
  },
}));

const ChannelsFilter = (props) => {
  const classes = useStyles();
  const { t } = useFormatter();
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchChannels());
  }, []);
  const channels = useHelper((helper) => helper.getChannels());
  const { onAddChannel, onClearChannel, onRemoveChannel, currentChannels, fullWidth } = props;
  const channelColor = (type) => {
    switch (type) {
      case 'newspaper':
        return '#3f51b5';
      case 'microblogging':
        return '#00bcd4';
      case 'tv':
        return '#ff9800';
      default:
        return '#ef41e1';
    }
  };
  const channelTransform = (n) => ({
    id: n.channel_id,
    label: n.channel_name,
    color: channelColor(n.channel_type),
    type: n.channel_type,
  });
  const channelsOptions = channels.map(channelTransform);
  return (
    <>
      <Autocomplete
        sx={{ width: fullWidth ? '100%' : 250, float: 'left' }}
        selectOnFocus={true}
        openOnFocus={true}
        autoSelect={false}
        autoHighlight={true}
        hiddenlabel={true}
        size="small"
        options={channelsOptions}
        onChange={(event, value, reason) => {
          // When removing, a null change is fired
          // We handle directly the remove through the chip deletion.
          if (value !== null) onAddChannel(value);
          if (reason === 'clear' && fullWidth) onClearChannel();
        }}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        renderOption={(p, option) => (
          <Box component="li" {...p}>
            <div className={classes.icon} style={{ color: option.color }}>
              <ChannelIcon type={option.type} />
            </div>
            <div className={classes.text}>{option.label}</div>
          </Box>
        )}
        renderInput={(params) => (
          <TextField
            label={t('Channels')}
            size="small"
            fullWidth={true}
            variant="outlined"
            {...params}
          />
        )}
      />
      {!fullWidth && (
        <div className={classes.filters}>
          {R.map(
            (currentChannel) => (
              <Chip
                key={currentChannel.id}
                classes={{ root: classes.filter }}
                label={currentChannel.label}
                onDelete={() => onRemoveChannel(currentChannel.id)}
              />
            ),
            currentChannels,
          )}
        </div>
      )}
    </>
  );
};

export default ChannelsFilter;
