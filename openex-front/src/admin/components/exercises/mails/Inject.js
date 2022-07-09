import React from 'react';
import { makeStyles, useTheme } from '@mui/styles';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import { fetchExerciseInjects } from '../../../../actions/Inject';
import { useFormatter } from '../../../../components/i18n';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { useHelper } from '../../../../store';
import AnimationMenu from '../AnimationMenu';
import Loader from '../../../../components/Loader';
import { fetchInjectCommunications } from '../../../../actions/Communication';
import ItemTags from '../../../../components/ItemTags';
import { resolveUserNames } from '../../../../utils/String';
import { fetchPlayers } from '../../../../actions/User';

const useStyles = makeStyles(() => ({
  container: {
    margin: '0 0 50px 0',
    padding: '0 200px 0 0',
  },
  paper: {
    position: 'relative',
    padding: '20px 20px 0 20px',
    overflow: 'hidden',
    height: '100%',
  },
}));

const Inject = () => {
  // Standard hooks
  const classes = useStyles();
  const theme = useTheme();
  const dispatch = useDispatch();
  const { t, fndt, nsdt } = useFormatter();
  const { injectId, exerciseId } = useParams();
  // Fetching data
  const { exercise, inject, communications, usersMap } = useHelper((helper) => {
    return {
      exercise: helper.getExercise(exerciseId),
      inject: helper.getInject(injectId),
      communications: helper.getInjectCommunications(injectId),
      usersMap: helper.getUsersMap(),
    };
  });
  useDataLoader(() => {
    dispatch(fetchExerciseInjects(exerciseId));
    dispatch(fetchInjectCommunications(exerciseId, injectId));
    dispatch(fetchPlayers());
  });
  // Rendering
  if (inject) {
    return (
      <div className={classes.container}>
        <AnimationMenu exerciseId={exerciseId} />
        <Grid container={true} spacing={3}>
          <Grid item={true} xs={6} style={{ marginTop: -10 }}>
            <Typography variant="h4">{t('Inject context')}</Typography>
            <Paper variant="outlined" classes={{ root: classes.paper }}>
              <Grid container={true} spacing={3}>
                <Grid item={true} xs={6}>
                  <Typography variant="h3">{t('Title')}</Typography>
                  {inject.inject_title}
                </Grid>
                <Grid item={true} xs={6}>
                  <Typography variant="h3">{t('Description')}</Typography>
                  {inject.inject_description}
                </Grid>
                <Grid item={true} xs={6}>
                  <Typography variant="h3">{t('Sent at')}</Typography>
                  {fndt(inject.inject_sent_at)}
                </Grid>
                <Grid item={true} xs={6}>
                  <Typography variant="h3">
                    {t('Sender email address')}
                  </Typography>
                  {exercise.exercise_mail_from}
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          <Grid item={true} xs={6} style={{ marginTop: -10 }}>
            <Typography variant="h4">{t('Inject details')}</Typography>
            <Paper variant="outlined" classes={{ root: classes.paper }}>
              <Grid container={true} spacing={3}>
                <Grid item={true} xs={6}>
                  <Typography variant="h3">{t('Targeted players')}</Typography>
                  {inject.inject_users_number}
                </Grid>
                <Grid item={true} xs={6}>
                  <Typography variant="h3">{t('Tags')}</Typography>
                  <ItemTags tags={inject.inject_tags} />
                </Grid>
                <Grid item={true} xs={6}>
                  <Typography variant="h3">{t('Documents')}</Typography>
                </Grid>
                <Grid item={true} xs={6}>
                  <Typography variant="h3">{t('Audiences')}</Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
        <br />
        <div style={{ marginTop: 40 }}>
          <Typography variant="h4" style={{ float: 'left' }}>
            {t('Mails')}
          </Typography>
          <div className="clearfix" />
          {communications.map((communication) => {
            const communicationUsers = communication.communication_users.map(
              (userId) => usersMap[userId] ?? {},
            );
            return (
              <Card
                key={communication.communication_id}
                classes={{ root: classes.card }}
                raised={false}
                variant="outlined"
              >
                <CardHeader
                  style={{
                    padding: '7px 10px 2px 15px',
                    borderBottom: `1px solid ${theme.palette.divider}`,
                  }}
                  title={
                    <div>
                      {communication.communication_animation ? (
                        <div
                          style={{
                            float: 'left',
                            fontDecoration: 'none',
                            textTransform: 'none',
                            paddingTop: 7,
                            fontSize: 15,
                          }}
                        >
                          <span style={{ color: theme.palette.text.secondary }}>
                            {t('Mail sent to')}
                          </span>
                          &nbsp;
                          <strong>
                            {resolveUserNames(communicationUsers)}
                          </strong>
                          &nbsp;
                          <span style={{ color: theme.palette.text.secondary }}>
                            {t('on')}{' '}
                            {nsdt(communication.communication_sent_at)}
                          </span>
                        </div>
                      ) : (
                        <div
                          style={{
                            float: 'left',
                            fontDecoration: 'none',
                            textTransform: 'none',
                            paddingTop: 7,
                            fontSize: 15,
                          }}
                        >
                          <strong>
                            {resolveUserNames(communicationUsers)}
                          </strong>
                          &nbsp;
                          <span style={{ color: theme.palette.text.secondary }}>
                            {t('sent an mail on on')}{' '}
                            {nsdt(communication.communication_sent_at)}
                          </span>
                        </div>
                      )}
                    </div>
                  }
                />
                <CardContent>
                  <strong>{communication.communication_subject}</strong>
                  <p>{communication.communication_content}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }
  return (
    <div className={classes.container}>
      <AnimationMenu exerciseId={exerciseId} />
      <Loader />
    </div>
  );
};

export default Inject;
