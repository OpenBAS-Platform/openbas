import React, { useState } from 'react';
import { makeStyles, styled } from '@mui/styles';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  Grid,
  IconButton,
  LinearProgress,
  linearProgressClasses,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import {
  CancelOutlined,
  CastOutlined,
  CheckCircleOutlineOutlined,
  DeleteOutlined,
  GroupsOutlined,
  HighlightOffOutlined,
  MarkEmailReadOutlined,
  NotificationsOutlined,
  PauseOutlined,
  PlayArrowOutlined,
  RestartAltOutlined,
  ScheduleOutlined,
  VideoSettingsOutlined,
} from '@mui/icons-material';
import * as R from 'ramda';
import { useDispatch } from 'react-redux';
import { fetchExerciseTeams, updateExercise, updateExerciseStatus } from '../../../actions/Exercise';
import { useFormatter } from '../../../components/i18n';
import ExerciseStatus from './ExerciseStatus';
import { useHelper } from '../../../store';
import ExerciseParametersForm from './ExerciseParametersForm';
import useDataLoader from '../../../utils/ServerSideEvent';
import Empty from '../../../components/Empty';
import Countdown from '../../../components/Countdown';
import { usePermissions } from '../../../utils/Exercise';
import Transition from '../../../components/common/Transition';
import ExerciseDatePopover from './ExerciseDatePopover';
import CreateControl from './controls/CreateControl';
import { deleteComcheck, fetchComchecks } from '../../../actions/Comcheck';
import { deleteDryrun, fetchDryruns } from '../../../actions/Dryrun';
import DryrunStatus from './controls/DryrunStatus';
import ComcheckState from './controls/ComcheckState';
import ExerciseInjectsDistribution from '../injects/ExerciseInjectsDistribution';

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
  paper2: {
    position: 'relative',
    padding: 0,
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
  item: {
    paddingLeft: 20,
    height: 50,
  },
  bodyItem: {
    float: 'left',
    height: 25,
    fontSize: 13,
    lineHeight: '25px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    verticalAlign: 'middle',
    textOverflow: 'ellipsis',
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
  const dispatch = useDispatch();
  const { exerciseId } = useParams();
  const permissions = usePermissions(exerciseId);
  const [openChangeStatus, setOpenChangeStatus] = useState(null);
  const [openComcheckDelete, setOpenComcheckDelete] = useState(null);
  const [openDryrunDelete, setOpenDryrunDelete] = useState(null);
  const { t, nsd, fldt } = useFormatter();
  const { exercise, teams, dryruns, comchecks } = useHelper((helper) => {
    const ex = helper.getExercise(exerciseId);
    const aud = helper.getExerciseTeams(exerciseId);
    const dry = helper.getExerciseDryruns(exerciseId);
    const com = helper.getExerciseComchecks(exerciseId);
    return { exercise: ex, teams: aud, dryruns: dry, comchecks: com };
  });
  useDataLoader(() => {
    dispatch(fetchExerciseTeams(exerciseId));
    dispatch(fetchComchecks(exerciseId));
    dispatch(fetchDryruns(exerciseId));
  });
  const submitUpdate = (data) => dispatch(updateExercise(exerciseId, data));
  const submitUpdateStatus = (status) => {
    dispatch(updateExerciseStatus(exerciseId, status));
    setOpenChangeStatus(null);
  };
  const submitComcheckDelete = () => {
    dispatch(deleteComcheck(exerciseId, openComcheckDelete));
    setOpenComcheckDelete(null);
  };
  const submitDryrunDelete = () => {
    dispatch(deleteDryrun(exerciseId, openDryrunDelete));
    setOpenDryrunDelete(null);
  };
  const initialValues = R.pipe(
    R.pick([
      'exercise_name',
      'exercise_description',
      'exercise_subtitle',
      'exercise_message_header',
      'exercise_mail_from',
    ]),
  )(exercise);
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
            disabled={permissions.readOnlyBypassStatus}
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
            disabled={permissions.readOnlyBypassStatus}
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
            disabled={permissions.readOnlyBypassStatus}
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
            disabled={permissions.readOnlyBypassStatus}
            onClick={() => setOpenChangeStatus('CANCELED')}
          >
            {t('Stop')}
          </Button>
        );
      case 'FINISHED':
      case 'CANCELED':
        return (
          <Button
            variant="contained"
            startIcon={<RestartAltOutlined />}
            color="warning"
            disabled={permissions.readOnlyBypassStatus}
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
            {t('Stop')}
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
                      exercise.exercise_status === 'PAUSED'
                      || exercise.exercise_status === 'CANCELED'
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
            <ExerciseInjectsDistribution teams={teams}/>
          </Paper>
        </Grid>
        <Grid item={true} xs={6} style={{ marginTop: 30 }}>
          <Typography variant="h4">{t('Settings')}</Typography>
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            <ExerciseParametersForm
              initialValues={initialValues}
              onSubmit={submitUpdate}
              disabled={permissions.readOnly}
            />
          </Paper>
        </Grid>
        <Grid item={true} xs={6} style={{ marginTop: 30 }}>
          <Typography variant="h4">{t('Dryruns')}</Typography>
          <Paper variant="outlined" classes={{ root: classes.paper2 }}>
            {dryruns.length > 0 ? (
              <List style={{ paddingTop: 0 }}>
                {dryruns.map((dryrun) => (
                  <ListItem
                    key={dryrun.dryrun_id}
                    dense={true}
                    button={true}
                    classes={{ root: classes.item }}
                    divider={true}
                    component={Link}
                    to={`/admin/exercises/${exercise.exercise_id}/controls/dryruns/${dryrun.dryrun_id}`}
                  >
                    <ListItemIcon>
                      <VideoSettingsOutlined />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <div>
                          <div
                            className={classes.bodyItem}
                            style={{ width: '30%' }}
                          >
                            {dryrun.dryrun_name}
                          </div>
                          <div
                            className={classes.bodyItem}
                            style={{ width: '15%' }}
                          >
                            {nsd(dryrun.dryrun_date)}
                          </div>
                          <div
                            className={classes.bodyItem}
                            style={{ width: '15%' }}
                          >
                            <code>{dryrun.dryrun_speed}x</code>
                          </div>
                          <div
                            className={classes.bodyItem}
                            style={{ width: '20%' }}
                          >
                            {t('injects')}
                          </div>
                          <div className={classes.bodyItem}>
                            <DryrunStatus
                              finished={dryrun.dryrun_finished}
                              variant="list"
                            />
                          </div>
                        </div>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        onClick={() => setOpenDryrunDelete(dryrun.dryrun_id)}
                        aria-haspopup="true"
                        size="large"
                        disabled={permissions.readOnlyBypassStatus}
                      >
                        <DeleteOutlined />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Empty message={t('No dryrun in this exercise.')} />
            )}
          </Paper>
        </Grid>
        <Grid item={true} xs={6} style={{ marginTop: 30 }}>
          <Typography variant="h4">{t('Comchecks')}</Typography>
          <Paper variant="outlined" classes={{ root: classes.paper2 }}>
            {comchecks.length > 0 ? (
              <List style={{ paddingTop: 0 }}>
                {comchecks.map((comcheck) => (
                  <ListItem
                    key={comcheck.comcheck_id}
                    dense={true}
                    button={true}
                    classes={{ root: classes.item }}
                    divider={true}
                    component={Link}
                    to={`/admin/exercises/${exercise.exercise_id}/controls/comchecks/${comcheck.comcheck_id}`}
                  >
                    <ListItemIcon>
                      <MarkEmailReadOutlined />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <div>
                          <div
                            className={classes.bodyItem}
                            style={{ width: '30%' }}
                          >
                            {comcheck.comcheck_name}
                          </div>
                          <div
                            className={classes.bodyItem}
                            style={{ width: '15%' }}
                          >
                            {nsd(comcheck.comcheck_end_date)}
                          </div>
                          <div
                            className={classes.bodyItem}
                            style={{ width: '20%' }}
                          >
                            <span style={{ fontWeight: 600 }}>
                              {comcheck.comcheck_users_number} &nbsp;
                            </span>
                            {t('players')}
                          </div>
                          <div className={classes.bodyItem}>
                            <ComcheckState
                              state={comcheck.comcheck_state}
                              variant="list"
                            />
                          </div>
                        </div>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        onClick={() => setOpenComcheckDelete(comcheck.comcheck_id)
                        }
                        aria-haspopup="true"
                        size="large"
                        disabled={permissions.readOnlyBypassStatus}
                      >
                        <DeleteOutlined />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Empty message={t('No comcheck in this exercise.')} />
            )}
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
      <Dialog
        open={Boolean(openComcheckDelete)}
        TransitionComponent={Transition}
        onClose={() => setOpenComcheckDelete(null)}
        PaperProps={{ elevation: 1 }}
      >
        <DialogContent>
          <DialogContentText>
            {t('Do you want to delete this comcheck?')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenComcheckDelete(null)}>
            {t('Cancel')}
          </Button>
          <Button color="secondary" onClick={submitComcheckDelete}>
            {t('Delete')}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={Boolean(openDryrunDelete)}
        TransitionComponent={Transition}
        onClose={() => setOpenDryrunDelete(null)}
        PaperProps={{ elevation: 1 }}
      >
        <DialogContent>
          <DialogContentText>
            {t('Do you want to delete this dryrun?')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDryrunDelete(null)}>
            {t('Cancel')}
          </Button>
          <Button color="secondary" onClick={submitDryrunDelete}>
            {t('Delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Exercise;
