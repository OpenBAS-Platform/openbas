import { Groups3Outlined, MailOutlined, NotificationsOutlined, PersonOutlined } from '@mui/icons-material';
import { Alert, Grid, Paper, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useParams } from 'react-router-dom';

import { fetchExercise, updateExercise } from '../../../../../actions/Exercise';
import type { ExerciseStore } from '../../../../../actions/exercises/Exercise';
import type { ExercisesHelper } from '../../../../../actions/exercises/exercise-helper';
import { useFormatter } from '../../../../../components/i18n';
import { useHelper } from '../../../../../store';
import { usePermissions } from '../../../../../utils/Exercise';
import { useAppDispatch } from '../../../../../utils/hooks';
import useDataLoader from '../../../../../utils/hooks/useDataLoader';
import DefinitionMenu from '../../../common/simulate/DefinitionMenu';
import EmailParametersForm, { SettingUpdateInput } from '../../../common/simulate/EmailParametersForm';
import PaperMetric from '../../../common/simulate/PaperMetric';
import CreateControl from '../controls/CreateControl';
import ExerciseControlComChecks from './ExerciseControlComChecks';
import ExerciseControlDryRuns from './ExerciseControlDryRuns';
import ExerciseInformation from './ExerciseInformation';

const useStyles = makeStyles(() => ({
  paper: {
    padding: 20,
    height: '100%',
  },
}));

const ExerciseSettings = () => {
  // Standard hooks
  const { t } = useFormatter();
  const classes = useStyles();
  const dispatch = useAppDispatch();

  const { exerciseId } = useParams() as { exerciseId: ExerciseStore['exercise_id'] };
  const permissions = usePermissions(exerciseId);

  // Fetching data
  const exercise = useHelper((helper: ExercisesHelper) => helper.getExercise(exerciseId));
  useDataLoader(() => {
    dispatch(fetchExercise(exerciseId));
  });

  const settingsMapping = (settings: ExerciseStore) => {
    return {
      setting_mail_from: settings.exercise_mail_from,
      setting_mails_reply_to: settings.exercise_mails_reply_to,
      setting_message_header: settings.exercise_message_header,
    };
  };

  const submitUpdate = (data: SettingUpdateInput) => {
    const exerciseUpdateInput = {
      ...exercise,
      exercise_mail_from: data.setting_mail_from || '',
      exercise_mails_reply_to: data.setting_mails_reply_to,
      exercise_message_header: data.setting_message_header,
    };
    dispatch(updateExercise(exercise.exercise_id, exerciseUpdateInput));
  };

  return (
    <>
      <DefinitionMenu base="/admin/exercises" id={exercise.exercise_id} />
      <Grid container spacing={3} style={{ marginBottom: 24 }}>
        <Grid item xs={3} sx={{ display: 'flex', flexDirection: 'column' }}>
          <PaperMetric title={t('Players')} icon={<PersonOutlined />} number={exercise.exercise_users_number ?? '-'} />
        </Grid>
        <Grid item xs={3} sx={{ display: 'flex', flexDirection: 'column' }}>
          <PaperMetric title={t('Injects')} icon={<NotificationsOutlined />} number={exercise.exercise_injects_statistics?.total_count ?? '-'} />
        </Grid>
        <Grid item xs={3} sx={{ display: 'flex', flexDirection: 'column' }}>
          <PaperMetric title={t('Teams')} icon={<Groups3Outlined />} number={exercise.exercise_teams.length ?? '-'} />
        </Grid>
        <Grid item xs={3} sx={{ display: 'flex', flexDirection: 'column' }}>
          <PaperMetric title={t('Messages')} icon={<MailOutlined />} number={exercise.exercise_communications_number ?? '-'} />
        </Grid>
      </Grid>
      <Grid container spacing={3} style={{ marginBottom: 24 }}>
        <Grid item xs={4} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h4">{t('Information')}</Typography>
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            <ExerciseInformation exercise={exercise} />
          </Paper>
        </Grid>
        <Grid item xs={4} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h4">{t('Settings')}</Typography>
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            <EmailParametersForm
              initialValues={settingsMapping(exercise)}
              onSubmit={submitUpdate}
              disabled={permissions.readOnly}
            />
          </Paper>
        </Grid>
        <Grid item xs={4} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h4">{t('Control')}</Typography>
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            <Alert severity="info">
              {t(
                'Before starting the simulation, you can launch a comcheck to validate player email addresses and a dryrun to send injects to the animation team.',
              )}
            </Alert>
            <CreateControl exerciseId={exercise.exercise_id} variant="buttons" />
          </Paper>
        </Grid>
        <Grid item xs={6} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h4">{t('Dryruns')}</Typography>
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            <ExerciseControlDryRuns exercise={exercise} />
          </Paper>
        </Grid>
        <Grid item xs={6} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h4">{t('Comchecks')}</Typography>
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            <ExerciseControlComChecks exercise={exercise} />
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default ExerciseSettings;
