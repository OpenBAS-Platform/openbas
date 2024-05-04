import React, { FunctionComponent } from 'react';
import { Button } from '@mui/material';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFormatter } from '../../../../components/i18n';
import type { ExerciseUpdateInput } from '../../../../utils/api-types';
import { zodImplement } from '../../../../utils/Zod';
import TextField from '../../../../components/fields/TextField';

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
    control,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
    setValue,
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
        style={{ marginTop: 10 }}
        error={!!errors.exercise_name}
        helperText={errors.exercise_name?.message}
        inputProps={register('exercise_name')}
        InputLabelProps={{ required: true }}
        control={control}
        setValue={setValue}
        askAi={true}
      />
      <TextField
        variant="standard"
        fullWidth
        label={t('Subtitle')}
        style={{ marginTop: 20 }}
        error={!!errors.exercise_subtitle}
        helperText={errors.exercise_subtitle?.message}
        inputProps={register('exercise_subtitle')}
        control={control}
        setValue={setValue}
        askAi={true}
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
        control={control}
        setValue={setValue}
        askAi={true}
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
