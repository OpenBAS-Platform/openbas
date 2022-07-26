import React from 'react';
import { makeStyles } from '@mui/styles';
import { useParams } from 'react-router-dom';
import { useHelper } from '../../../store';

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
    paddingBottom: 50,
  },
}));

const Media = () => {
  const classes = useStyles();
  const { mediaId } = useParams();
  const { media } = useHelper((helper) => {
    const med = helper.getMedia(mediaId);
    return { media: med };
  });
  return (
    <div className={classes.root}>
      {media.media_description}
    </div>
  );
};

export default Media;
