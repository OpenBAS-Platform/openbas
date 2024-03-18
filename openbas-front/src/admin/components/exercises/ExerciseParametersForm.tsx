import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, TextField as MuiTextField } from '@mui/material';
import React from 'react';
import { z } from 'zod';
import { useFormatter } from '../../../components/i18n';
import type { ExerciseParametersInput } from '../../../utils/api-types';
import EmailListField from '../../../components/EmailListField';

interface Props {
  onSubmit: SubmitHandler<ExerciseParametersInput>;
  initialValues?: ExerciseParametersInput;
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

  const {
    register,
    handleSubmit,
    setValue,
    formState: { isDirty, isSubmitting },
  } = useForm<ExerciseParametersInput>({
    mode: 'onTouched',
    resolver: zodResolver(
      z.object({
        exercise_mail_from: z.string().email(),
        exercise_mails_reply_to: z.array(z.string()).optional(),
        exercise_message_header: z.string().optional(),
      }).strict(),
    ),
    defaultValues: initialValues,
  });

  return (
    <form id="variableForm" onSubmit={handleSubmit(onSubmit)}>
      <MuiTextField
        variant="standard"
        fullWidth
        label={t('Sender email address')}
        inputProps={register('exercise_mail_from')}
        disabled={disabled}
      />
      <EmailListField
        name="exercise_mails_reply_to"
        savedEmails={initialValues.exercise_mails_reply_to || []}
        label={t('Reply to')}
        setFieldValue={(value) => setValue('exercise_mails_reply_to', [value])}
      />
      <MuiTextField
        variant="standard"
        fullWidth
        multiline
        rows={1}
        label={t('Messages header')}
        style={{ marginTop: 20 }}
        inputProps={register('exercise_message_header')}
        disabled={disabled}
      />
      <div style={{ float: 'right', marginTop: 20 }}>
        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={!isDirty || isSubmitting}
        >{ t('Update')}
        </Button>
      </div>
    </form>
  );
};

export default ExerciseParametersForm;
