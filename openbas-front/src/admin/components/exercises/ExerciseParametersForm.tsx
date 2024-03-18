import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Autocomplete, Button, Chip, TextField, TextField as MuiTextField } from '@mui/material';
import React, { useState } from 'react';
import { z } from 'zod';
import { useFormatter } from '../../../components/i18n';
import { zodImplement } from '../../../utils/Zod';
import { ExerciseUpdateInput } from '../../../utils/api-types';

interface Props {
  onSubmit: SubmitHandler<ExerciseUpdateInput>;
  initialValues?: ExerciseUpdateInput;
  disabled?: boolean;
}

const ExerciseParametersForm: React.FC<Props> = ({
  onSubmit,
  initialValues = {
    exercise_mail_from: '',
    exercise_mails_reply_to: [],
    exercise_message_header: '',
  },
  disabled,
}) => {
  // Standard hooks
  const { t } = useFormatter();
  const [inputValue, setInputValue] = useState('');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ExerciseUpdateInput>({
    mode: 'onTouched',
    resolver: zodResolver(
      zodImplement<ExerciseUpdateInput>().with(
        {
          exercise_description: z.string().optional(),
          exercise_message_footer: z.string().optional(),
          exercise_name: z.string(),
          exercise_subtitle: z.string().optional(),
          exercise_mail_from: z.string().email().optional(),
          exercise_mails_reply_to: z.array(z.string().email()).optional(),
          exercise_message_header: z.string().optional(),
        },
      ),
    ),
    defaultValues: initialValues,
  });

  return (
    <form id="variableForm" onSubmit={handleSubmit(onSubmit)}>
      <MuiTextField
        variant="standard"
        fullWidth
        label={t('Sender email address')}
        error={!!errors.exercise_mail_from}
        helperText={
                    errors.exercise_mail_from && errors.exercise_mail_from?.message
                }
        inputProps={register('exercise_mail_from')}
        disabled={disabled}
      />
      <Controller
        control={control}
        name="exercise_mails_reply_to"
        render={({ field, fieldState }) => {
          return (
            <Autocomplete
              multiple
              id="email-input"
              freeSolo
              open={false}
              options={[]}
              value={field.value}
              onChange={() => {
                if (undefined !== field.value && inputValue !== '' && !field.value.includes(inputValue)) {
                  field.onChange([...(field.value || []), inputValue]);
                }
              }}
              onBlur={field.onBlur}
              inputValue={inputValue}
              onInputChange={(_event, newInputValue) => {
                setInputValue(newInputValue);
              }}
              disableClearable={true}
              renderTags={(tags: string[], getTagProps) => tags.map((email: string, index: number) => (
                <Chip
                  variant="outlined"
                  label={email}
                  {...getTagProps({ index })}
                  key={email}
                  onDelete={() => {
                    const newValue = [...(field.value || [])];
                    newValue.splice(index, 1);
                    field.onChange(newValue);
                  }
                                    }
                />
              ))}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="standard"
                  label={t('Reply to')}
                  style={{ marginTop: 20 }}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          );
        }}
      />
      <MuiTextField
        variant="standard"
        fullWidth
        multiline
        rows={1}
        label={t('Messages header')}
        style={{ marginTop: 20 }}
        error={!!errors.exercise_message_header}
        helperText={
                    errors.exercise_message_header && errors.exercise_message_header?.message
                }
        inputProps={register('exercise_message_header')}
        disabled={disabled}
      />
      <div style={{ float: 'right', marginTop: 20 }}>
        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={!isDirty || isSubmitting}
        >{t('Update')}
        </Button>
      </div>
    </form>
  );
};

export default ExerciseParametersForm;
