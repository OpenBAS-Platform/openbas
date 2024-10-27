/* eslint-disable no-template-curly-in-string */
import { useState } from 'react';

import * as React from 'react';
import { SpeedDial, SpeedDialIcon, SpeedDialAction, Dialog, DialogTitle, DialogContent, Grid, Typography, Button } from '@mui/material';
import { VideoSettingsOutlined, MarkEmailReadOutlined } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import { useNavigate } from 'react-router-dom';
import ComcheckForm from './ComcheckForm';
import DryrunForm from './DryrunForm';
import { resolveUserName } from '../../../../../utils/String';
import { isExerciseReadOnly, usePermissions } from '../../../../../utils/Exercise';
import type { Theme } from '../../../../../components/Theme';
import { useAppDispatch } from '../../../../../utils/hooks';
import type { ComcheckInput, Exercise } from '../../../../../utils/api-types';
import { addComcheck } from '../../../../../actions/Comcheck';
import { addDryrun } from '../../../../../actions/Dryrun';
import { useFormatter } from '../../../../../components/i18n';
import Transition from '../../../../../components/common/Transition';
import { useHelper } from '../../../../../store';
import type { UserHelper } from '../../../../../actions/helper';
import type { TeamsHelper } from '../../../../../actions/teams/team-helper';
import type { ExercisesHelper } from '../../../../../actions/exercises/exercise-helper';

const useStyles = makeStyles<Theme>(() => ({
  createButton: {
    position: 'fixed',
    bottom: 30,
    right: 30,
  },
}));

interface Props {
  exerciseId: Exercise['exercise_id'];
  variant?: string;
}

const CreateControl: React.FC<Props> = ({ exerciseId, variant }) => {
  const [openComcheck, setOpenComcheck] = useState(false);
  const [openDryrun, setOpenDryrun] = useState(false);

  const classes = useStyles();
  const { t } = useFormatter();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { me, exercise, teams } = useHelper(
    (helper: UserHelper & ExercisesHelper & TeamsHelper) => {
      return {
        me: helper.getMe(),
        exercise: helper.getExercise(exerciseId),
        teams: helper.getExerciseTeams(exerciseId),
      };
    },
  );

  const initialValues = {
    dryrun_users: [{ id: me.user_id, label: resolveUserName(me) }],
  };

  const onSubmitComcheck = async (data: ComcheckInput) => {
    const result = await dispatch(addComcheck(exerciseId, data));
    navigate(
      `/admin/exercises/${exerciseId}/controls/comchecks/${result.result}`,
    );
  };

  const onSubmitDryrun = async (data: typeof initialValues) => {
    const inputValues = {
      ...data,
      dryrun_users: data.dryrun_users.map(({ id }) => id),
    };

    const result = await dispatch(addDryrun(exerciseId, inputValues));
    navigate(
      `/admin/exercises/${exerciseId}/controls/dryruns/${result.result}`,
    );
  };

  const permissions = usePermissions(exercise.exercise_id);

  return (
    <div>
      {variant === 'buttons' ? (
        <Grid container={true} spacing={3} style={{ marginTop: 0 }}>
          <Grid item={true} xs={6}>
            <Typography variant="h3">{t('Dryrun')}</Typography>
            <Button
              variant="contained"
              startIcon={<VideoSettingsOutlined />}
              color="info"
              onClick={() => setOpenDryrun(true)}
              disabled={!permissions.canWrite}
            >
              {t('Launch')}
            </Button>
          </Grid>
          <Grid item={true} xs={4}>
            <Typography variant="h3">{t('Comcheck')}</Typography>
            <Button
              variant="contained"
              startIcon={<MarkEmailReadOutlined />}
              color="secondary"
              onClick={() => setOpenComcheck(true)}
              disabled={!permissions.canWrite}
            >
              {t('Send')}
            </Button>
          </Grid>
        </Grid>
      ) : (
        <SpeedDial
          classes={{ root: classes.createButton }}
          icon={<SpeedDialIcon />}
          ariaLabel={t('New control')}
          hidden={isExerciseReadOnly(exercise)}
        >
          <SpeedDialAction
            icon={<VideoSettingsOutlined />}
            tooltipTitle={t('Launch a new dryrun')}
            onClick={() => setOpenDryrun(true)}
          />
          <SpeedDialAction
            icon={<MarkEmailReadOutlined />}
            tooltipTitle={t('Send a new comcheck')}
            onClick={() => setOpenComcheck(true)}
          />
        </SpeedDial>
      )}
      <Dialog
        open={openComcheck}
        TransitionComponent={Transition}
        onClose={() => setOpenComcheck(false)}
        fullWidth={true}
        maxWidth="md"
        PaperProps={{ elevation: 1 }}
      >
        <DialogTitle>{t('Send a new comcheck')}</DialogTitle>
        <DialogContent style={{ overflowX: 'hidden' }}>
          <ComcheckForm
            onSubmit={onSubmitComcheck}
            initialValues={{
              comcheck_teams: [],
              comcheck_subject: t('[${exercise.name}] Communication check'),
              comcheck_message: `${t('Hello')},<br /><br />${t(
                'This is a communication check before the beginning of the simulation. Please click on the following link'
                + ' in order to confirm you successfully received this message: <a href="${comcheck.url}">${comcheck.url}</a>.',
              )}<br /><br />${t('Best regards')},<br />${t(
                'The simulation control team',
              )}`,
            }}
            teams={teams}
            handleClose={() => setOpenComcheck(false)}
          />
        </DialogContent>
      </Dialog>
      <Dialog
        open={openDryrun}
        TransitionComponent={Transition}
        onClose={() => setOpenDryrun(false)}
        fullWidth={true}
        maxWidth="md"
        PaperProps={{ elevation: 1 }}
      >
        <DialogTitle>{t('Launch a new dryrun')}</DialogTitle>
        <DialogContent>
          <DryrunForm
            initialValues={initialValues}
            onSubmit={onSubmitDryrun}
            handleClose={() => setOpenDryrun(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateControl;
