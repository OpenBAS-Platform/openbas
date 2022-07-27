import React from 'react';
import { makeStyles } from '@mui/styles';
import { useParams } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import * as R from 'ramda';
import { useDispatch } from 'react-redux';
import { useHelper } from '../../../store';
import { useFormatter } from '../../../components/i18n';
import { updateMedia } from '../../../actions/Media';
import MediaParametersForm from './MediaParametersForm';

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
    paddingBottom: 50,
  },
  paper: {
    padding: 20,
    marginBottom: 40,
  },
}));

const Media = () => {
  const classes = useStyles();
  const { mediaId } = useParams();
  const dispatch = useDispatch();
  const { t } = useFormatter();
  const { media } = useHelper((helper) => {
    const med = helper.getMedia(mediaId);
    return { media: med };
  });
  const submitUpdate = (data) => dispatch(updateMedia(mediaId, data));
  const initialValues = R.pipe(
    R.pick([
      'media_type',
      'media_name',
      'media_description',
      'media_primary_color_dark',
      'media_primary_color_light',
      'media_secondary_color_dark',
      'media_secondary_color_light',
    ]),
  )(media);
  return (
    <div className={classes.root}>
      <Grid container={true} spacing={3} style={{ marginTop: -14 }}>
        <Grid item={true} xs={6} style={{ marginTop: -14 }}>
          <Typography variant="h4">{t('Parameters')}</Typography>
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            <MediaParametersForm
              onSubmit={submitUpdate}
              initialValues={initialValues}
            />
          </Paper>
        </Grid>
        <Grid item={true} xs={6} style={{ marginTop: -14 }}>
          <Typography variant="h4">{t('Overview')}</Typography>
          <Paper variant="outlined" classes={{ root: classes.paper }}></Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default Media;
