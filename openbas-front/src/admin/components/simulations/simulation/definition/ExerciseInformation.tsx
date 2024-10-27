import { Grid, Typography } from '@mui/material';
import { FunctionComponent } from 'react';
import { useFormatter } from '../../../../../components/i18n';
import type { ExerciseStore } from '../../../../../actions/exercises/Exercise';

interface Props {
  exercise: ExerciseStore;
}

const ExerciseInformation: FunctionComponent<Props> = ({
  exercise,
}) => {
  // Standard hooks
  const { fldt, t } = useFormatter();

  return (
    <Grid container spacing={3}>
      <Grid item xs={6}>
        <Typography variant="h3">{t('Subtitle')}</Typography>
        {exercise.exercise_subtitle || '-'}
      </Grid>
      <Grid item xs={6}>
        <Typography variant="h3">{t('Description')}</Typography>
        {exercise.exercise_description || '-'}
      </Grid>
      <Grid item xs={6}>
        <Typography variant="h3">{t('Creation date')}</Typography>
        {fldt(exercise.exercise_created_at)}
      </Grid>
      <Grid item xs={6}>
        <Typography variant="h3">
          {t('Sender email address')}
        </Typography>
        {exercise.exercise_mail_from}
      </Grid>
    </Grid>
  );
};

export default ExerciseInformation;
