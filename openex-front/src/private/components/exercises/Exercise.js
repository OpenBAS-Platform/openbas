import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import { withStyles, styled } from '@mui/styles';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import { withRouter } from 'react-router-dom';
import {
  GroupsOutlined,
  NotificationsOutlined,
  CheckCircleOutlineOutlined,
  ScheduleOutlined,
  HighlightOffOutlined,
  CastOutlined,
  PlayArrowOutlined,
} from '@mui/icons-material';
import LinearProgress, {
  linearProgressClasses,
} from '@mui/material/LinearProgress';
import inject18n from '../../../components/i18n';
import ExerciseStatus from './ExerciseStatus';

const styles = () => ({
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
    width: '60%',
    float: 'right',
    marginRight: 150,
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
});

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

const Exercise = (props) => {
  const {
    t, fldt, classes, exercise,
  } = props;
  return (
      <div className={classes.root}>
        <Grid container={true} spacing={3}>
          <Grid item={true} xs={6}>
            <Paper variant="outlined" classes={{ root: classes.metric }}>
              <div className={classes.icon}>
                {iconStatus(exercise.exercise_status)}
              </div>
              <div className={classes.title}>{t('Status')}</div>
              <ExerciseStatus status={exercise.exercise_status} />
              <div className={classes.progress}>
                <BorderLinearProgress value={exercise?.exercise_injects_statistics?.total_progress ?? 0} variant="determinate" />
              </div>
            </Paper>
          </Grid>
          <Grid item={true} xs={3}>
            <Paper variant="outlined" classes={{ root: classes.metric }}>
              <div className={classes.icon}>
                <NotificationsOutlined color="primary" sx={{ fontSize: 50 }} />
              </div>
              <div className={classes.title}>{t('Injects')}</div>
              <div className={classes.number}>{exercise?.exercise_injects_statistics?.total_count ?? '-'}</div>
            </Paper>
          </Grid>
          <Grid item={true} xs={3}>
            <Paper variant="outlined" classes={{ root: classes.metric }}>
              <div className={classes.icon}>
                <GroupsOutlined color="primary" sx={{ fontSize: 50 }} />
              </div>
              <div className={classes.title}>{t('Players')}</div>
              <div className={classes.number}>{exercise?.exercise_users_number ?? '-'}</div>
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
              </Grid>
            </Paper>
          </Grid>
          <Grid item={true} xs={6}>
            <Typography variant="overline">{t('Control')}</Typography>
            <Paper variant="outlined" classes={{ root: classes.paper }}>
              <Grid container={true} spacing={3}>
                <Grid item={true} xs={6}>
                  <Typography variant="h1">{t('Play')}</Typography>
                  <Button
                    variant="contained"
                    endIcon={<PlayArrowOutlined />}
                    color="success"
                  >
                    {t('Démarrer')}
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </div>
  );
};

Exercise.propTypes = {
  t: PropTypes.func,
  nsdt: PropTypes.func,
  exercise: PropTypes.object,
};

export default R.compose(inject18n, withRouter, withStyles(styles))(Exercise);
