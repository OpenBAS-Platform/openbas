import React, { FunctionComponent } from 'react';
import { Button, TextField as MuiTextField, Theme } from '@mui/material';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFormatter } from '../../../../components/i18n';
import { ScenarioInformationsInput } from '../../../../utils/api-types';
import { zodImplement } from '../../../../utils/Zod';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: Theme) => ({
  buttons: {
    display: 'flex',
    justifyContent: 'end',
  },
}));

interface Props {
  onSubmit: SubmitHandler<ScenarioInformationsInput>;
  initialValues: ScenarioInformationsInput;
  disabled: boolean;
}

const ScenarioSettingsForm: FunctionComponent<Props> = ({
  onSubmit,
  initialValues = {
    scenario_mail_from: '',
    scenario_message_header: '',
  },
  disabled,
}) => {
  // Standard hooks
  const classes = useStyles();
  const { t } = useFormatter();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ScenarioInformationsInput>({
    mode: 'onTouched',
    resolver: zodResolver(
      zodImplement<ScenarioInformationsInput>().with({
        scenario_mail_from: z.string().email(t('Should be a valid email address')),
        scenario_message_header: z.string().optional(),
        scenario_message_footer: z.string().optional(),
      }),
    ),
    defaultValues: initialValues,
  });

  return (
    <form id="scenarioSettingsForm" onSubmit={handleSubmit(onSubmit)}>
      <MuiTextField
        variant="standard"
        fullWidth
        label={t('Sender email address')}
        error={!!errors.scenario_mail_from}
        helperText={errors.scenario_mail_from && errors.scenario_mail_from?.message}
        inputProps={register('scenario_mail_from')}
        disabled={disabled}
      />
      <MuiTextField
        variant="standard"
        fullWidth
        label={t('Messages header')}
        style={{ marginTop: 20 }}
        error={!!errors.scenario_message_header}
        helperText={errors.scenario_message_header && errors.scenario_message_header?.message}
        inputProps={register('scenario_message_header')}
        disabled={disabled}
      />
      <div className={classes.buttons} style={{ marginTop: 20 }}>
        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={!isDirty || isSubmitting}
        >
          {t('Update')}
        </Button>
      </div>
    </form>
  );
};

export default ScenarioSettingsForm;
