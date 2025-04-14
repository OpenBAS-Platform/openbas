import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { FunctionComponent } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

import TextField from '../../../../../components/fields/TextField';
import { useFormatter } from '../../../../../components/i18n';
import type { ThemeInput } from '../../../../../utils/api-types';
import { zodImplement } from '../../../../../utils/Zod';

interface Props {
  onSubmit: SubmitHandler<{
    trigger: string;
    notification_type: string;
    subject: string;
  }>;
  editing?: boolean;
  initialValues?: {
    trigger: string;
    notification_type: string;
    subject: string;
  };
  handleClose: () => void;
  scenarioName: string;
}

const NotificationRuleForm: FunctionComponent<Props> = ({
  onSubmit,
  editing,
  scenarioName,
  initialValues = {
    trigger: 'difference',
    notification_type: 'mail',
    subject: { scenarioName }.scenarioName + ' - alert',
  },
  handleClose,
}) => {
  // Standard hooks
  const { t } = useFormatter();
  const theme = useTheme();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<{
    trigger: string;
    notification_type: string;
    subject: string;
  }>({
    mode: 'onTouched',
    resolver: zodResolver(
      zodImplement<ThemeInput>().with({
        trigger: z.string(),
        notification_type: z.string(),
        subject: z.string(),
      }),
    ),
    defaultValues: initialValues,
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
        inputProps={register('subject')}
        InputLabelProps={{ required: true }}
      />

      <TextField
        variant="standard"
        disabled
        fullWidth
        label={t('Trigger on')}
        error={!!errors.trigger}
        inputProps={register('trigger')}
      />

      <TextField
        variant="standard"
        disabled
        fullWidth
        label={t('Notifier')}
        error={!!errors.notification_type}
        inputProps={register('notification_type')}
      />

      <div style={{ alignSelf: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={handleClose}
          style={{ marginRight: 10 }}
          disabled={isSubmitting}
        >
          {editing ? t('Delete') : t('Cancel')}
        </Button>
        <Button
          variant="contained"
          color="secondary"
          type="submit"
          disabled={!isDirty || isSubmitting}
        >
          {editing ? t('Update') : t('Create')}
        </Button>
      </div>
    </form>
  );
};

export default NotificationRuleForm;
