import React, { FunctionComponent } from 'react';
import { Button, TextField } from '@mui/material';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFormatter } from '../../../components/i18n';
import type { ExerciseUpdateInput } from '../../../utils/api-types';
import { zodImplement } from '../../../utils/Zod';

interface Props {
  onSubmit: SubmitHandler<ExerciseUpdateInput>;
  handleClose: () => void;
  initialValues?: ExerciseUpdateInput;
}

const ExerciseUpdateForm: FunctionComponent<Props> = ({
  onSubmit,
  handleClose,
  initialValues = {
    exercise_name: '',
    exercise_subtitle: '',
    exercise_description: '',
  },
}) => {
  // Standard hooks
  const { t } = useFormatter();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ExerciseUpdateInput>({
    mode: 'onTouched',
    resolver: zodResolver(
      zodImplement<Pick<ExerciseUpdateInput, 'exercise_name' | 'exercise_subtitle' | 'exercise_description'>>().with({
        exercise_name: z.string().min(1, { message: t('Should not be empty') }),
        exercise_subtitle: z.string().optional(),
        exercise_description: z.string().optional(),
      }),
    ),
    defaultValues: initialValues,
  });

  return (
    <form id="exerciseUpdateForm" onSubmit={handleSubmit(onSubmit)}>
      <TextField
        variant="standard"
        fullWidth
        label={t('Name')}
        error={!!errors.exercise_name}
        helperText={errors.exercise_name?.message}
        inputProps={register('exercise_name')}
        InputLabelProps={{ required: true }}
      />
      <TextField
        variant="standard"
        fullWidth
        label={t('Subtitle')}
        style={{ marginTop: 20 }}
        error={!!errors.exercise_subtitle}
        helperText={errors.exercise_subtitle?.message}
        inputProps={register('exercise_subtitle')}
      />
      <TextField
        variant="standard"
        fullWidth
        multiline
        rows={2}
        label={t('Description')}
        style={{ marginTop: 20 }}
        error={!!errors.exercise_description}
        helperText={errors.exercise_description?.message}
        inputProps={register('exercise_description')}
      />

      <div style={{ float: 'right', marginTop: 20 }}>
        <Button
          onClick={handleClose}
          style={{ marginRight: 10 }}
          disabled={isSubmitting}
        >
          {t('Cancel')}
        </Button>
        <Button
          color="secondary"
          type="submit"
          disabled={!isDirty || isSubmitting}
        >
          {t('Update')}
        </Button>
      </div>
    </form>
  );
};

export default ExerciseUpdateForm;
