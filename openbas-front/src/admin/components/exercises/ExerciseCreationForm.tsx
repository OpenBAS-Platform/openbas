import React, { FunctionComponent } from 'react';
import { Button, TextField } from '@mui/material';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DateTimePicker as MuiDateTimePicker } from '@mui/x-date-pickers/DateTimePicker/DateTimePicker';
import { useFormatter } from '../../../components/i18n';
import TagField from '../../../components/field/TagField';
import type { ExerciseCreateInput } from '../../../utils/api-types';
import { zodImplement } from '../../../utils/Zod';

interface Props {
  onSubmit: SubmitHandler<ExerciseCreateInput>;
  handleClose: () => void;
  initialValues?: ExerciseCreateInput;
}

const ExerciseCreationForm: FunctionComponent<Props> = ({
  onSubmit,
  handleClose,
  initialValues = {
    exercise_name: '',
    exercise_subtitle: '',
    exercise_description: '',
    exercise_start_date: '',
    exercise_tags: [],
  },
}) => {
  // Standard hooks
  const { t } = useFormatter();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ExerciseCreateInput>({
    mode: 'onTouched',
    resolver: zodResolver(
      zodImplement<ExerciseCreateInput>().with({
        exercise_name: z.string().min(1, { message: t('Should not be empty') }),
        exercise_subtitle: z.string().optional(),
        exercise_description: z.string().optional(),
        exercise_start_date: z.string().optional(),
        exercise_tags: z.string().array().optional(),
      }),
    ),
    defaultValues: initialValues,
  });

  return (
    <form id="exerciseForm" onSubmit={handleSubmit(onSubmit)}>
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
      <Controller
        control={control}
        name="exercise_start_date"
        render={({ field }) => (
          <MuiDateTimePicker
            value={field.value ? new Date(field.value) : ''}
            label={t('Start date (optional)')}
            minDateTime={new Date()}
            slotProps={{
              textField: {
                variant: 'standard',
                fullWidth: true,
                style: { marginTop: 20 },
                error: !!errors.exercise_start_date,
                helperText: errors.exercise_start_date && errors.exercise_start_date?.message,
              },
            }}
            onChange={(date) => {
              if (date instanceof Date) {
                field.onChange(date?.toISOString());
              }
            }}
            ampm={false}
            format="yyyy-MM-dd HH:mm:ss"
          />
        )}
      />
      <Controller
        control={control}
        name="exercise_tags"
        render={({ field: { onChange, value } }) => (
          <TagField
            name="exercise_tags"
            label={t('Tags')}
            fieldValue={value ?? []}
            fieldOnChange={onChange}
            errors={errors}
            style={{ marginTop: 20 }}
          />
        )}
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
          {t('Create')}
        </Button>
      </div>
    </form>
  );
};

export default ExerciseCreationForm;
