import React from 'react';
import { makeStyles, styled } from '@mui/styles';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import { useParams } from 'react-router-dom';
import {
  GroupsOutlined,
  NotificationsOutlined,
  CheckCircleOutlineOutlined,
  ScheduleOutlined,
  HighlightOffOutlined,
  CastOutlined,
  PlayArrowOutlined,
  VideoSettingsOutlined,
  MarkEmailReadOutlined,
} from '@mui/icons-material';
import LinearProgress, {
  linearProgressClasses,
} from '@mui/material/LinearProgress';
import { useFormatter } from '../../../components/i18n';
import ExerciseStatus from './ExerciseStatus';
import { useStore } from '../../../store';

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
  },
  metric: {
    position: 'relative',
    padding: 20,
    height: 100,
    overflow: 'hidden',
  },
  title: {
    fontSize: 16,
  },
  number: {
    fontSize: 30,
    fontWeight: 800,
    float: 'left',
  },
  progress: {
    float: 'right',
    margin: '25px 90px 0 50px',
    flexGrow: 1,
  },
  icon: {
    position: 'absolute',
    top: 25,
    right: 15,
  },
  paper: {
    position: 'relative',
    padding: 20,
    overflow: 'hidden',
    height: '100%',
  },
}));

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: theme.palette.primary.main,
  },
}));

const iconStatus = (status) => {
  switch (status) {
    case 'FINISHED':
      return (
        <CheckCircleOutlineOutlined color="primary" sx={{ fontSize: 50 }} />
      );
    case 'CANCELED':
      return <HighlightOffOutlined color="primary" sx={{ fontSize: 50 }} />;
    case 'RUNNING':
      return <CastOutlined color="primary" sx={{ fontSize: 50 }} />;
    default:
      return <ScheduleOutlined color="primary" sx={{ fontSize: 50 }} />;
  }
};

const Exercise = () => {
  const classes = useStyles();
  const { exerciseId } = useParams();
  const { t, fldt } = useFormatter();
  const exercise = useStore((store) => store.getExercise(exerciseId));
  return (
    <div className={classes.root}>
      <Grid container={true} spacing={3}>
        <Grid item={true} xs={6}>
          <Paper
            variant="outlined"
            classes={{ root: classes.metric }}
            style={{ display: 'flex' }}
          >
            <div className={classes.icon}>
              {iconStatus(exercise.exercise_status)}
            </div>
            <div>
              <div className={classes.title}>{t('Status')}</div>
              <ExerciseStatus status={exercise.exercise_status} />
            </div>
            <div className={classes.progress}>
              <BorderLinearProgress
                value={
                  exercise?.exercise_injects_statistics?.total_progress ?? 0
                }
                variant="determinate"
              />
            </div>
          </Paper>
        </Grid>
        <Grid item={true} xs={3}>
          <Paper variant="outlined" classes={{ root: classes.metric }}>
            <div className={classes.icon}>
              <NotificationsOutlined color="primary" sx={{ fontSize: 50 }} />
            </div>
            <div className={classes.title}>{t('Injects')}</div>
            <div className={classes.number}>
              {exercise?.exercise_injects_statistics?.total_count ?? '-'}
            </div>
          </Paper>
        </Grid>
        <Grid item={true} xs={3}>
          <Paper variant="outlined" classes={{ root: classes.metric }}>
            <div className={classes.icon}>
              <GroupsOutlined color="primary" sx={{ fontSize: 50 }} />
            </div>
            <div className={classes.title}>{t('Players')}</div>
            <div className={classes.number}>
              {exercise?.exercise_users_number ?? '-'}
            </div>
          </Paper>
        </Grid>
      </Grid>
      <br />
      <Grid container={true} spacing={3}>
        <Grid item={true} xs={6}>
          <Typography variant="overline">{t('Information')}</Typography>
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            <Grid container={true} spacing={3}>
              <Grid item={true} xs={6}>
                <Typography variant="h1">{t('Description')}</Typography>
                {exercise.exercise_description || '-'}
              </Grid>
              <Grid item={true} xs={6}>
                <Typography variant="h1">{t('Start date')}</Typography>
                {fldt(exercise.exercise_start_date) || t('Manual')}
              </Grid>
              <Grid item={true} xs={6}>
                <Typography variant="h1">{t('Creation date')}</Typography>
                {fldt(exercise.exercise_created_at)}
              </Grid>
              <Grid item={true} xs={6}>
                <Typography variant="h1">{t('Sender mail address')}</Typography>
                {exercise.exercise_mail_from}
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item={true} xs={6}>
          <Typography variant="overline">{t('Control')}</Typography>
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            <Alert severity="info">
              {t(
                'Before starting the exercise, you can launch a comcheck to validate player email addresses and trigger a dryrun to send injects to the animation team.',
              )}
            </Alert>
            <Grid container={true} spacing={3} style={{ marginTop: 0 }}>
              <Grid item={true} xs={4}>
                <Typography variant="h1">{t('Execution')}</Typography>
                <Button
                  variant="contained"
                  endIcon={<PlayArrowOutlined />}
                  color="success"
                >
                  {t('Start')}
                </Button>
              </Grid>
              <Grid item={true} xs={4}>
                <Typography variant="h1">{t('Dryrun')}</Typography>
                <Button
                  variant="contained"
                  endIcon={<VideoSettingsOutlined />}
                  color="info"
                >
                  {t('Launch')}
                </Button>
              </Grid>
              <Grid item={true} xs={4}>
                <Typography variant="h1">{t('Comcheck')}</Typography>
                <Button
                  variant="contained"
                  endIcon={<MarkEmailReadOutlined />}
                  color="secondary"
                >
                  {t('Send')}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default Exercise;
