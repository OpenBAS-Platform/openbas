import React, { FunctionComponent, useState } from 'react';
import { Autocomplete, Button, Chip, TextField, TextField as MuiTextField } from '@mui/material';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { makeStyles } from '@mui/styles';
import { useFormatter } from '../../../../components/i18n';
import type { ScenarioInformationInput } from '../../../../utils/api-types';
import { zodImplement } from '../../../../utils/Zod';
import useScenarioPermissions from '../../../../utils/Scenario';

const useStyles = makeStyles(() => ({
  buttons: {
    display: 'flex',
    justifyContent: 'end',
  },
}));

interface Props {
  onSubmit: SubmitHandler<ScenarioInformationInput>;
  initialValues: ScenarioInformationInput;
  scenarioId: string;
}

const ScenarioSettingsForm: FunctionComponent<Props> = ({
  onSubmit,
  initialValues = {
    scenario_mail_from: '',
    scenario_mails_reply_to: [],
    scenario_message_header: '',
  },
  scenarioId,
}) => {
  // Standard hooks
  const classes = useStyles();
  const { t } = useFormatter();
  const permissions = useScenarioPermissions(scenarioId);
  const [inputValue, setInputValue] = useState('');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ScenarioInformationInput>({
    mode: 'onTouched',
    resolver: zodResolver(
      zodImplement<ScenarioInformationInput>().with({
        scenario_mail_from: z.string().email(t('Should be a valid email address')),
        scenario_message_header: z.string().optional(),
        scenario_message_footer: z.string().optional(),
        scenario_mails_reply_to: z.array(z.string().email()).optional(),
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
        disabled={permissions.readOnly}
      />
      <Controller
        control={control}
        name="scenario_mails_reply_to"
        render={({ field, fieldState }) => {
          return (
            <Autocomplete
              multiple
              id="email-reply-to-input"
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
        label={t('Messages header')}
        style={{ marginTop: 20 }}
        error={!!errors.scenario_message_header}
        helperText={errors.scenario_message_header && errors.scenario_message_header?.message}
        inputProps={register('scenario_message_header')}
        disabled={permissions.readOnly}
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
