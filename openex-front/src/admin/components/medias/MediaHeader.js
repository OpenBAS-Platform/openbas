import React from 'react';
import { makeStyles } from '@mui/styles';
import { Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import MediaPopover from './MediaPopover';
import { useHelper } from '../../../store';

const useStyles = makeStyles(() => ({
  container: {
    width: '100%',
  },
  title: {
    float: 'left',
    textTransform: 'uppercase',
  },
}));

const MediaHeader = () => {
  const classes = useStyles();
  const { mediaId } = useParams();
  const { media, userAdmin } = useHelper((helper) => ({
    media: helper.getMedia(mediaId),
    userAdmin: helper.getMe()?.user_admin ?? false,
  }));
  return (
    <div className={classes.container}>
      <Typography
        variant="h1"
        gutterBottom={true}
        classes={{ root: classes.title }}
      >
        {media.media_name}
      </Typography>
      {userAdmin && <MediaPopover media={media} />}
    </div>
  );
};

export default MediaHeader;
