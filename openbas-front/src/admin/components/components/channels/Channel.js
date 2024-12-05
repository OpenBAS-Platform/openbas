import { Grid, Paper, Skeleton, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import * as R from 'ramda';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router';

import { updateChannel, updateChannelLogos } from '../../../../actions/channels/channel-action';
import { fetchDocuments } from '../../../../actions/Document';
import { useFormatter } from '../../../../components/i18n';
import { useHelper } from '../../../../store';
import useDataLoader from '../../../../utils/hooks/useDataLoader';
import ChannelAddLogo from './ChannelAddLogo';
import ChannelOverviewMicroblogging from './ChannelOverviewMicroblogging';
import ChannelOverviewNewspaper from './ChannelOverviewNewspaper';
import ChannelOverviewTvChannel from './ChannelOverviewTvChannel';
import ChannelParametersForm from './ChannelParametersForm';

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  paper: {
    padding: 20,
    marginBottom: 20,
  },
}));

const Channel = () => {
  const classes = useStyles();
  const { channelId } = useParams();
  const dispatch = useDispatch();
  const { t } = useFormatter();
  const { channel, documentsMap, userAdmin } = useHelper((helper) => {
    const med = helper.getChannel(channelId);
    const docsMap = helper.getDocumentsMap();
    return {
      channel: med,
      documentsMap: docsMap,
      userAdmin: helper.getMe()?.user_admin ?? false,
    };
  });
  useDataLoader(() => {
    dispatch(fetchDocuments());
  });
  const submitUpdate = data => dispatch(updateChannel(channelId, data));
  const submitLogo = (documentId, theme) => {
    const data = {
      channel_logo_dark: theme === 'dark' ? documentId : channel.channel_logo_dark,
      channel_logo_light: theme === 'light' ? documentId : channel.channel_logo_light,
    };
    return dispatch(updateChannelLogos(channelId, data));
  };
  const initialValues = R.pipe(
    R.pick([
      'channel_type',
      'channel_name',
      'channel_description',
      'channel_mode',
      'channel_primary_color_dark',
      'channel_primary_color_light',
      'channel_secondary_color_dark',
      'channel_secondary_color_light',
    ]),
  )(channel);
  const logoDark = documentsMap && channel.channel_logo_dark
    ? documentsMap[channel.channel_logo_dark]
    : null;
  const logoLight = documentsMap && channel.channel_logo_light
    ? documentsMap[channel.channel_logo_light]
    : null;
  const enrichedChannel = R.pipe(
    R.assoc('logoDark', logoDark),
    R.assoc('logoLight', logoLight),
  )(channel);
  return (
    <div className={classes.root}>
      <Grid container={true} spacing={3}>
        <Grid item={true} xs={6} style={{ paddingTop: 10 }}>
          <Typography variant="h4">{t('Parameters')}</Typography>
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            <ChannelParametersForm
              onSubmit={submitUpdate}
              initialValues={initialValues}
              disabled={!userAdmin}
            />
          </Paper>
          <Typography variant="h4">
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
                  <ChannelAddLogo
                    handleAddLogo={documentId => submitLogo(documentId, 'dark')}
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
                  <ChannelAddLogo
                    handleAddLogo={documentId => submitLogo(documentId, 'light')}
                  />
                )}
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item={true} xs={6} style={{ paddingTop: 10 }}>
          <Typography variant="h4">{t('Overview')}</Typography>
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            {channel.channel_type === 'newspaper' && (
              <ChannelOverviewNewspaper channel={enrichedChannel} />
            )}
            {channel.channel_type === 'microblogging' && (
              <ChannelOverviewMicroblogging channel={enrichedChannel} />
            )}
            {channel.channel_type === 'tv' && (
              <ChannelOverviewTvChannel channel={enrichedChannel} />
            )}
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default Channel;
