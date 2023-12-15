import React from 'react';
import { makeStyles } from '@mui/styles';
import { useParams } from 'react-router-dom';
import { Grid, Typography, Paper, Skeleton } from '@mui/material';
import * as R from 'ramda';
import { useDispatch } from 'react-redux';
import { useHelper } from '../../../store';
import { useFormatter } from '../../../components/i18n';
import { updateMedia, updateMediaLogos } from '../../../actions/Media';
import MediaParametersForm from './MediaParametersForm';
import MediaOverviewNewspaper from './MediaOverviewNewspaper';
import MediaOverviewMicroblogging from './MediaOverviewMicroblogging';
import MediaOverviewTvChannel from './MediaOverviewTvChannel';
import MediaAddLogo from './MediaAddLogo';
import useDataLoader from '../../../utils/ServerSideEvent';
import { fetchDocuments } from '../../../actions/Document';

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
  const { media, documentsMap, userAdmin } = useHelper((helper) => {
    const med = helper.getMedia(mediaId);
    const docsMap = helper.getDocumentsMap();
    return {
      media: med,
      documentsMap: docsMap,
      userAdmin: helper.getMe()?.user_admin ?? false,
    };
  });
  useDataLoader(() => {
    dispatch(fetchDocuments());
  });
  const submitUpdate = (data) => dispatch(updateMedia(mediaId, data));
  const submitLogo = (documentId, theme) => {
    const data = {
      media_logo_dark: theme === 'dark' ? documentId : media.media_logo_dark,
      media_logo_light: theme === 'light' ? documentId : media.media_logo_light,
    };
    return dispatch(updateMediaLogos(mediaId, data));
  };
  const initialValues = R.pipe(
    R.pick([
      'media_type',
      'media_name',
      'media_description',
      'media_mode',
      'media_primary_color_dark',
      'media_primary_color_light',
      'media_secondary_color_dark',
      'media_secondary_color_light',
    ]),
  )(media);
  const logoDark = documentsMap && media.media_logo_dark
    ? documentsMap[media.media_logo_dark]
    : null;
  const logoLight = documentsMap && media.media_logo_light
    ? documentsMap[media.media_logo_light]
    : null;
  const enrichedMedia = R.pipe(
    R.assoc('logoDark', logoDark),
    R.assoc('logoLight', logoLight),
  )(media);
  return (
    <div className={classes.root}>
      <Grid container={true} spacing={3}>
        <Grid item={true} xs={6}>
          <Typography variant="h4">{t('Parameters')}</Typography>
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            <MediaParametersForm
              onSubmit={submitUpdate}
              initialValues={initialValues}
              disabled={!userAdmin}
            />
          </Paper>
          <Typography variant="h4" style={{ marginTop: 20 }}>
            {t('Logos')}
          </Typography>
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            <Grid container={true} spacing={3}>
              <Grid item={true} xs={6}>
                <Typography variant="h5" style={{ marginBottom: 20 }}>
                  {t('Dark theme')}
                </Typography>
                {logoDark ? (
                  <img
                    src={`/api/documents/${logoDark.document_id}/file`}
                    style={{ maxHeight: 200, maxWidth: 200 }}
                  />
                ) : (
                  <Skeleton
                    sx={{ width: 200, height: 200 }}
                    animation={false}
                    variant="rectangular"
                  />
                )}
                {userAdmin && (
                  <MediaAddLogo
                    handleAddLogo={(documentId) => submitLogo(documentId, 'dark')
                    }
                  />
                )}
              </Grid>
              <Grid item={true} xs={6}>
                <Typography variant="h5" style={{ marginBottom: 20 }}>
                  {t('Light theme')}
                </Typography>
                {logoLight ? (
                  <img
                    src={`/api/documents/${logoLight.document_id}/file`}
                    style={{ maxHeight: 200, maxWidth: 200 }}
                  />
                ) : (
                  <Skeleton
                    sx={{ width: 200, height: 200 }}
                    animation={false}
                    variant="rectangular"
                  />
                )}
                {userAdmin && (
                  <MediaAddLogo
                    handleAddLogo={(documentId) => submitLogo(documentId, 'light')
                    }
                  />
                )}
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item={true} xs={6}>
          <Typography variant="h4">{t('Overview')}</Typography>
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            {media.media_type === 'newspaper' && (
              <MediaOverviewNewspaper media={enrichedMedia} />
            )}
            {media.media_type === 'microblogging' && (
              <MediaOverviewMicroblogging media={enrichedMedia} />
            )}
            {media.media_type === 'tv' && (
              <MediaOverviewTvChannel media={enrichedMedia} />
            )}
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default Media;
