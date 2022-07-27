import React from 'react';
import { makeStyles, useTheme } from '@mui/styles';
import Typography from '@mui/material/Typography';
import { useFormatter } from '../../../components/i18n';

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
    paddingBottom: 50,
  },
}));

const MediaOverviewNewspaper = ({ media }) => {
  const classes = useStyles();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { t } = useFormatter();
  return (
    <div className={classes.root}>
      <Typography
        variant="h1"
        style={{
          textAlign: 'center',
          color: isDark
            ? media.media_primary_color_dark
            : media.media_primary_color_light,
          fontSize: 40,
        }}
      >
        {media.media_name}
      </Typography>
      <Typography
        variant="h2"
        style={{
          textAlign: 'center',
        }}
      >
        {media.media_description}
      </Typography>
    </div>
  );
};

export default MediaOverviewNewspaper;
