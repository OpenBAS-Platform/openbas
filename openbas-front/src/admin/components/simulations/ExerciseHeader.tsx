import React, { useState } from 'react';
import { makeStyles } from '@mui/styles';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, Typography } from '@mui/material';
import { CancelOutlined, PauseOutlined, PlayArrowOutlined, RestartAltOutlined } from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { updateExerciseStatus, updateExerciseTags } from '../../../actions/Exercise';
import ExercisePopover from './ExercisePopover';
import { useHelper } from '../../../store';
import { useFormatter } from '../../../components/i18n';
import Transition from '../../../components/common/Transition';
import { usePermissions } from '../../../utils/Exercise';
import ExerciseDatePopover from './ExerciseDatePopover';
import Countdown from '../../../components/Countdown';
import ExerciseStatus from './ExerciseStatus';
import HeaderTags from '../scenarios/scenario/HeaderTags';
import { useAppDispatch } from '../../../utils/hooks';
import type { ExerciseStore } from '../../../actions/exercises/Exercise';
import type { ExercisesHelper } from '../../../actions/exercises/exercise-helper';
import type { Exercise as ExerciseType } from '../../../utils/api-types';

const useStyles = makeStyles(() => ({
  title: {
    textTransform: 'uppercase',
    marginBottom: 0,
  },
  countdown: {
    letterSpacing: 2,
    fontSize: 16,
  },
}));

const Buttons = ({ exerciseId, exerciseStatus, exerciseName }: { exerciseId: ExerciseStore['exercise_id'], exerciseStatus: ExerciseStore['exercise_status'], exerciseName: ExerciseStore['exercise_name'] }) => {
  // Standard hooks
  const { t } = useFormatter();
  const dispatch = useAppDispatch();
  const permissions = usePermissions(exerciseId);

  const [openChangeStatus, setOpenChangeStatus] = useState<ExerciseStore['exercise_status'] | null>(null);
  const submitUpdateStatus = (status: ExerciseStore['exercise_status']) => {
    dispatch(updateExerciseStatus(exerciseId, status));
    setOpenChangeStatus(null);
  };

  const executionButton = () => {
    switch (exerciseStatus) {
      case 'SCHEDULED': {
        if (!permissions.readOnlyBypassStatus) {
          return (
            <Button
              variant="contained"
              startIcon={<PlayArrowOutlined />}
              color="success"
              onClick={() => setOpenChangeStatus('RUNNING')}
            >
              {t('Start')}
            </Button>
          );
        }
        return (<></>);
      }

      case 'RUNNING': {
        if (!permissions.readOnlyBypassStatus) {
          return (
            <Button
              variant="contained"
              startIcon={<PauseOutlined />}
              color="warning"
              onClick={() => setOpenChangeStatus('PAUSED')}
            >
              {t('Pause')}
            </Button>
          );
        }
        return (<></>);
      }
      case 'PAUSED': {
        if (!permissions.readOnlyBypassStatus) {
          return (
            <Button
              variant="contained"
              startIcon={<PlayArrowOutlined />}
              color="success"
              onClick={() => setOpenChangeStatus('RUNNING')}
            >
              {t('Resume')}
            </Button>
          );
        }
        return (<></>);
      }
      default:
        return (<></>);
    }
  };

  const dangerousButton = () => {
    switch (exerciseStatus) {
      case 'RUNNING':
      case 'PAUSED': {
        if (!permissions.readOnlyBypassStatus) {
          return (
            <Button
              variant="contained"
              startIcon={<CancelOutlined />}
              color="error"
              onClick={() => setOpenChangeStatus('CANCELED')}
            >
              {t('Stop')}
            </Button>
          );
        }
        return (<></>);
      }
      case 'FINISHED':
      case 'CANCELED': {
        if (!permissions.readOnlyBypassStatus) {
          return (
            <Button
              variant="contained"
              startIcon={<RestartAltOutlined />}
              color="warning"
              onClick={() => setOpenChangeStatus('SCHEDULED')}
            >
              {t('Reset')}
            </Button>
          );
        }
        return (<></>);
      }
      default:
        return (<></>);
    }
  };

  const dialogContentText = () => {
    switch (openChangeStatus) {
      case 'RUNNING': return `${exerciseName} ${t('will be started, do you want to continue?')}`
      case 'PAUSED': return `${t('Injects will be paused, do you want to continue?')}`
      case 'SCHEDULED': return `${exerciseName} ${t('data will be reset, do you want to restart?')}`
      case 'CANCELED': return `${exerciseName} ${t('data will be reset, do you want to restart?')}`
      default:
        return 'Do you want to change the status of this simulation?';
    }
  }
  return (
    <>
      {executionButton()}
      {dangerousButton()}
      <Dialog
        open={Boolean(openChangeStatus)}
        TransitionComponent={Transition}
        onClose={() => setOpenChangeStatus(null)}
        PaperProps={{ elevation: 1 }}
      >
        <DialogContent>
          <DialogContentText>
            {dialogContentText()}
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
    </>
  );
};

const ExerciseHeader = () => {
  const classes = useStyles();
  const { t, fldt } = useFormatter();
  const { exerciseId } = useParams() as { exerciseId: ExerciseType['exercise_id'] };
  const permissions = usePermissions(exerciseId);
  const { exercise } = useHelper((helper: ExercisesHelper) => {
    return {
      exercise: helper.getExercise(exerciseId),
    };
  });

  const nextInjectDate = exercise.exercise_next_inject_date
    ? new Date(exercise.exercise_next_inject_date).getTime()
    : Date.now();

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Typography
              variant="h1"
              gutterBottom
              classes={{ root: classes.title }}
            >
              {exercise.exercise_name}
            </Typography>
            <ExerciseStatus exerciseStatus={exercise.exercise_status} />
          </div>
          <ExercisePopover exercise={exercise} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
            {t('Start: ')}
          </Typography>
          {fldt(exercise.exercise_start_date) || t('Manual')}
          <ExerciseDatePopover exercise={exercise} />
        </div>
      </div>
      <div>
        <div style={{ display: 'flex', placeContent: 'end', gap: 8 }}>
          <HeaderTags
            tags={exercise.exercise_tags}
            disabled={permissions.readOnlyBypassStatus}
            updateTags={(tagIds) => updateExerciseTags(exercise.exercise_id, { exercise_tags: tagIds })}
          />
          {<Buttons exerciseId={exercise.exercise_id} exerciseStatus={exercise.exercise_status} exerciseName={exercise.exercise_name}/>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', placeContent: 'end', marginTop: 8, gap: 8 }}>
          <Typography variant="h3" style={{ margin: 0 }}>
            {t('Next Inject: ')}
          </Typography>
          <div className={classes.countdown}>
            <Countdown
              date={nextInjectDate}
              paused={
                exercise.exercise_status === 'PAUSED'
                || exercise.exercise_status === 'CANCELED'
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseHeader;
