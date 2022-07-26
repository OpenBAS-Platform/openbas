import React from 'react';
import { makeStyles } from '@mui/styles';
import Typography from '@mui/material/Typography';
import { useParams } from 'react-router-dom';
import MediaPopover from './MediaPopover';
import { useHelper } from '../../../store';

const useStyles = makeStyles(() => ({
  container: {
    width: '100%',
  },
  containerWithPadding: {
    width: '100%',
    paddingRight: 200,
  },
  title: {
    float: 'left',
    textTransform: 'uppercase',
  },
  tags: {
    marginTop: -4,
    float: 'right',
  },
  tag: {
    marginLeft: 5,
  },
  tagsInput: {
    width: 300,
    margin: '0 10px 0 10px',
    float: 'right',
  },
}));

const MediaHeader = () => {
  const classes = useStyles();
  const { mediaId } = useParams();
  const { media } = useHelper((helper) => {
    return {
      media: helper.getMedia(mediaId),
    };
  });
  return (
    <div className={classes.container}>
      <Typography
        variant="h1"
        gutterBottom={true}
        classes={{ root: classes.title }}
      >
        {media.media_name}
      </Typography>
      <MediaPopover media={media} />
    </div>
  );
};

export default MediaHeader;
