import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { FunctionComponent } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

import TextField from '../../../../../components/fields/TextField';
import { useFormatter } from '../../../../../components/i18n';
import type { CreateNotificationRuleInput } from '../../../../../utils/api-types';
import { zodImplement } from '../../../../../utils/Zod';

interface Props {
  onSubmit: SubmitHandler<CreateNotificationRuleInput>;
  creationInitialValues: CreateNotificationRuleInput;
  handleClose: () => void;
}

const CreationNotificationRuleForm: FunctionComponent<Props> = ({
  onSubmit,
  creationInitialValues,
  handleClose,
}) => {
  // Standard hooks
  const { t } = useFormatter();
  const theme = useTheme();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateNotificationRuleInput>({
    mode: 'onTouched',
    resolver: zodResolver(
      zodImplement<CreateNotificationRuleInput>().with({
        resource_id: z.string(),
        resource_type: z.string(),
        trigger: z.string(),
        type: z.string(),
        subject: z.string().min(1, { message: t('Should not be empty') }),
      }),
    ),
    defaultValues: creationInitialValues,
  });

  return (
    <form
      id="notificationRuleForm"
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
        gap: theme.spacing(2),
      }}
      onSubmit={handleSubmit(onSubmit)}
    >
      <TextField
        variant="standard"
        fullWidth
        label={t('Email subject')}
        error={!!errors.subject}
        helperText={errors.subject?.message}
        inputProps={register('subject')}
        InputLabelProps={{ required: true }}
      />

      <TextField
        variant="standard"
        disabled
        fullWidth
        label={t('Trigger on')}
        inputProps={register('trigger')}
      />

      <TextField
        variant="standard"
        disabled
        fullWidth
        label={t('Notifier')}
        inputProps={register('type')}
      />

      <div style={{ alignSelf: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={handleClose}
          style={{ marginRight: theme.spacing(1) }}
          disabled={isSubmitting}
        >
          {t('Cancel')}
        </Button>
        <Button
          variant="contained"
          color="secondary"
          type="submit"
          disabled={isSubmitting}
        >
          {t('Create')}
        </Button>
      </div>
    </form>
  );
};

export default CreationNotificationRuleForm;
