import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Autocomplete, Button, Chip, TextField, TextField as MuiTextField } from '@mui/material';
import React, { useState } from 'react';
import { z } from 'zod';
import { makeStyles } from '@mui/styles';
import { useFormatter } from '../../../components/i18n';
import { zodImplement } from '../../../utils/Zod';

const useStyles = makeStyles(() => ({
  buttons: {
    display: 'flex',
    justifyContent: 'end',
  },
}));
export interface SettingUpdateInput {
  setting_mail_from?: string;
  setting_mails_reply_to?: string[];
  setting_message_header?: string;
}

interface Props {
  onSubmit: SubmitHandler<SettingUpdateInput>;
  initialValues?: SettingUpdateInput;
  disabled?: boolean;
}

const SettingsForm: React.FC<Props> = ({
  onSubmit,
  initialValues = {
    setting_mail_from: '',
    setting_mails_reply_to: [],
    setting_message_header: '',
  },
  disabled,
}) => {
  // Standard hooks
  const classes = useStyles();
  const { t } = useFormatter();
  const [inputValue, setInputValue] = useState('');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<SettingUpdateInput>({
    mode: 'onTouched',
    resolver: zodResolver(
      zodImplement<SettingUpdateInput>().with(
        {
          setting_mail_from: z.string().email(t('Should be a valid email address')).optional(),
          setting_mails_reply_to: z.array(z.string().email()).optional(),
          setting_message_header: z.string().optional(),
        },
      ),
    ),
    defaultValues: initialValues,
  });

  return (
    <form id="settingsForm" onSubmit={handleSubmit(onSubmit)}>
      <MuiTextField
        variant="standard"
        fullWidth
        label={t('Sender email address')}
        error={!!errors.setting_mail_from}
        helperText={errors.setting_mail_from && errors.setting_mail_from?.message}
        inputProps={register('setting_mail_from')}
        disabled={disabled}
      />
      <Controller
        control={control}
        name="setting_mails_reply_to"
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
                  }}
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
        error={!!errors.setting_message_header}
        helperText={errors.setting_message_header && errors.setting_message_header?.message}
        inputProps={register('setting_message_header')}
        disabled={disabled}
      />
      <div className={classes.buttons} style={{ marginTop: 20 }}>
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

export default SettingsForm;
