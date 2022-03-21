import React, { useState } from 'react';
import Chart from 'react-apexcharts';
import { makeStyles, styled, useTheme } from '@mui/styles';
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
  CancelOutlined,
  PauseOutlined,
  RestartAltOutlined,
} from '@mui/icons-material';
import LinearProgress, {
  linearProgressClasses,
} from '@mui/material/LinearProgress';
import * as R from 'ramda';
import { useDispatch } from 'react-redux';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import {
  updateExercise,
  updateExerciseStatus,
} from '../../../actions/Exercise';
import { useFormatter } from '../../../components/i18n';
import ExerciseStatus from './ExerciseStatus';
import { useHelper } from '../../../store';
import ExerciseParametersForm from './ExerciseParametersForm';
import useDataLoader from '../../../utils/ServerSideEvent';
import { fetchAudiences } from '../../../actions/Audience';
import Empty from '../../../components/Empty';
import Countdown from '../../../components/Countdown';
import { distributionChartOptions } from '../../../utils/Charts';
import { isExerciseReadOnly } from '../../../utils/Exercise';
import { Transition } from '../../../utils/Environment';
import ExerciseDatePopover from './ExerciseDatePopover';
import CreateControl from './controls/CreateControl';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    marginTop: -20,
    paddingBottom: 50,
  },
  metric: {
    position: 'relative',
    padding: 20,
    height: 100,
    overflow: 'hidden',
  },
  title: {
    textTransform: 'uppercase',
    fontSize: 12,
    fontWeight: 500,
    color: theme.palette.text.secondary,
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
    padding: '20px 20px 0 20px',
    overflow: 'hidden',
    height: '100%',
  },
  paperChart: {
    position: 'relative',
    padding: '0 20px 0 0',
    overflow: 'hidden',
    height: '100%',
  },
  countdown: {
    letterSpacing: 2,
    fontSize: 20,
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
  const theme = useTheme();
  const dispatch = useDispatch();
  const { exerciseId } = useParams();
  const [openChangeStatus, setOpenChangeStatus] = useState(null);
  const { t, fldt } = useFormatter();
  const { exercise, audiences } = useHelper((helper) => {
    const ex = helper.getExercise(exerciseId);
    const aud = helper.getExerciseAudiences(exerciseId);
    return { exercise: ex, audiences: aud };
  });
  useDataLoader(() => {
    dispatch(fetchAudiences(exerciseId));
  });
  const submitUpdate = (data) => dispatch(updateExercise(exerciseId, data));
  const submitUpdateStatus = (status) => {
    dispatch(updateExerciseStatus(exerciseId, status));
    setOpenChangeStatus(null);
  };
  const initialValues = R.pipe(
    R.pick([
      'exercise_name',
      'exercise_description',
      'exercise_subtitle',
      'exercise_message_header',
      'exercise_message_footer',
      'exercise_mail_from',
    ]),
  )(exercise);
  const topAudiences = R.pipe(
    R.sortWith([R.descend(R.prop('audience_injects_number'))]),
    R.take(6),
  )(audiences || []);
  const distributionChartData = [
    {
      name: t('Number of injects'),
      data: topAudiences.map((a) => ({
        x: a.audience_name,
        y: a.audience_injects_number,
      })),
    },
  ];
  const maxInjectsNumber = Math.max(
    ...topAudiences.map((a) => a.audience_injects_number),
  );
  const nextInjectDate = exercise.exercise_next_inject_date
    ? new Date(exercise.exercise_next_inject_date).getTime()
    : Date.now();
  const buttonExecution = () => {
    switch (exercise.exercise_status) {
      case 'SCHEDULED':
        return (
          <Button
            variant="contained"
            startIcon={<PlayArrowOutlined />}
            color="success"
            disabled={isExerciseReadOnly(exercise, true)}
            onClick={() => setOpenChangeStatus('RUNNING')}
          >
            {t('Start')}
          </Button>
        );
      case 'RUNNING':
        return (
          <Button
            variant="contained"
            startIcon={<PauseOutlined />}
            color="warning"
            disabled={isExerciseReadOnly(exercise, true)}
            onClick={() => setOpenChangeStatus('PAUSED')}
          >
            {t('Pause')}
          </Button>
        );
      case 'PAUSED':
        return (
          <Button
            variant="contained"
            startIcon={<PlayArrowOutlined />}
            color="success"
            disabled={isExerciseReadOnly(exercise, true)}
            onClick={() => setOpenChangeStatus('RUNNING')}
          >
            {t('Resume')}
          </Button>
        );
      default:
        return (
          <Button
            variant="contained"
            startIcon={<PauseOutlined />}
            color="warning"
            disabled={true}
            onClick={() => setOpenChangeStatus('PAUSED')}
          >
            {t('Pause')}
          </Button>
        );
    }
  };
  const buttonDangerous = () => {
    switch (exercise.exercise_status) {
      case 'RUNNING':
      case 'PAUSED':
        return (
          <Button
            variant="contained"
            startIcon={<CancelOutlined />}
            color="error"
            disabled={isExerciseReadOnly(exercise, true)}
            onClick={() => setOpenChangeStatus('CANCELED')}
          >
            {t('Cancel')}
          </Button>
        );
      case 'FINISHED':
      case 'CANCELED':
        return (
          <Button
            variant="contained"
            startIcon={<RestartAltOutlined />}
            color="warning"
            disabled={isExerciseReadOnly(exercise, true)}
            onClick={() => setOpenChangeStatus('SCHEDULED')}
          >
            {t('Reset')}
          </Button>
        );
      default:
        return (
          <Button
            variant="contained"
            startIcon={<CancelOutlined />}
            color="error"
            disabled={true}
          >
            {t('Cancel')}
          </Button>
        );
    }
  };
  return (
    <div className={classes.root}>
      <Grid container={true} spacing={3} style={{ marginTop: -14 }}>
        <Grid item={true} xs={6} style={{ marginTop: -14 }}>
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
                  exercise.exercise_injects_statistics?.total_progress ?? 0
                }
                variant="determinate"
              />
            </div>
          </Paper>
        </Grid>
        <Grid item={true} xs={3} style={{ marginTop: -14 }}>
          <Paper variant="outlined" classes={{ root: classes.metric }}>
            <div className={classes.icon}>
              <NotificationsOutlined color="primary" sx={{ fontSize: 50 }} />
            </div>
            <div className={classes.title}>{t('Injects')}</div>
            <div className={classes.number}>
              {exercise.exercise_injects_statistics?.total_count ?? '-'}
            </div>
          </Paper>
        </Grid>
        <Grid item={true} xs={3} style={{ marginTop: -14 }}>
          <Paper variant="outlined" classes={{ root: classes.metric }}>
            <div className={classes.icon}>
              <GroupsOutlined color="primary" sx={{ fontSize: 50 }} />
            </div>
            <div className={classes.title}>{t('Players')}</div>
            <div className={classes.number}>
              {exercise.exercise_users_number ?? '-'}
            </div>
          </Paper>
        </Grid>
      </Grid>
      <br />
      <Grid container={true} spacing={3}>
        <Grid item={true} xs={4}>
          <Typography variant="h4">{t('Information')}</Typography>
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            <Grid container={true} spacing={3}>
              <Grid item={true} xs={6}>
                <Typography variant="h3">{t('Subtitle')}</Typography>
                {exercise.exercise_subtitle || '-'}
              </Grid>
              <Grid item={true} xs={6}>
                <Typography variant="h3">{t('Description')}</Typography>
                {exercise.exercise_description || '-'}
              </Grid>
              <Grid item={true} xs={6}>
                <Typography variant="h3">{t('Creation date')}</Typography>
                {fldt(exercise.exercise_created_at)}
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
        <Grid item={true} xs={4}>
          <Typography variant="h4">{t('Execution')}</Typography>
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            <Grid container={true} spacing={3}>
              <Grid item={true} xs={6}>
                <Typography variant="h3" style={{ float: 'left' }}>
                  {t('Start date')}
                </Typography>
                <ExerciseDatePopover exercise={exercise} />
                <div className="clearfix" />
                {fldt(exercise.exercise_start_date) || t('Manual')}
              </Grid>
              <Grid item={true} xs={6}>
                <Typography variant="h3">{t('Next inject')}</Typography>
                <div className={classes.countdown}>
                  <Countdown
                    date={nextInjectDate}
                    paused={
                      exercise?.exercise_status === 'PAUSED'
                      || exercise?.exercise_status === 'CANCELED'
                    }
                  />
                </div>
              </Grid>
              <Grid item={true} xs={6}>
                <Typography variant="h3">{t('Execution')}</Typography>
                {buttonExecution()}
              </Grid>
              <Grid item={true} xs={6}>
                <Typography variant="h3">{t('Dangerous zone')}</Typography>
                {buttonDangerous()}
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item={true} xs={4}>
          <Typography variant="h4">{t('Control')}</Typography>
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            <Alert severity="info">
              {t(
                'Before starting the exercise, you can launch a comcheck to validate player email addresses and a dryrun to send injects to the animation team.',
              )}
            </Alert>
            <CreateControl exerciseId={exerciseId} variant="buttons" />
          </Paper>
        </Grid>
        <Grid item={true} xs={6} style={{ marginTop: 30 }}>
          <Typography variant="h4">{t('Injects distribution')}</Typography>
          <Paper variant="outlined" classes={{ root: classes.paperChart }}>
            {topAudiences.length > 0 ? (
              <Chart
                options={distributionChartOptions(theme, maxInjectsNumber < 2)}
                series={distributionChartData}
                type="bar"
                width="100%"
                height={50 + topAudiences.length * 50}
              />
            ) : (
              <Empty message={t('No audiences in this exercise.')} />
            )}
          </Paper>
        </Grid>
        <Grid item={true} xs={6} style={{ marginTop: 30 }}>
          <Typography variant="h4">{t('Settings')}</Typography>
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            <ExerciseParametersForm
              initialValues={initialValues}
              onSubmit={submitUpdate}
              disabled={isExerciseReadOnly(exercise)}
            />
          </Paper>
        </Grid>
      </Grid>
      <Dialog
        open={Boolean(openChangeStatus)}
        TransitionComponent={Transition}
        onClose={() => setOpenChangeStatus(null)}
        PaperProps={{ elevation: 1 }}
      >
        <DialogContent>
          <DialogContentText>
            {t('Do you want to change the status of this exercise?')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenChangeStatus(null)}>
            {t('Cancel')}
          </Button>
          <Button
            color="secondary"
            onClick={() => submitUpdateStatus({ exercise_status: openChangeStatus })
            }
          >
            {t('Confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Exercise;
