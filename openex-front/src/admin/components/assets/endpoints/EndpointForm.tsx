import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { Button, FormHelperText, MenuItem, TextField } from '@mui/material';
import React, { FormEventHandler } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DateTimePicker as MuiDateTimePicker } from '@mui/x-date-pickers';
import { useFormatter } from '../../../../components/i18n';
import type { EndpointInput } from '../../../../utils/api-types';
import { zodImplement } from '../../../../utils/Zod';
import TagField from '../../../../components/field/TagField';

interface Props {
  onSubmit: SubmitHandler<EndpointInput>;
  handleClose: () => void;
  editing?: boolean;
  initialValues?: EndpointInput;
}

const EndpointForm: React.FC<Props> = ({
  onSubmit,
  handleClose,
  editing,
  initialValues = {
    asset_name: '',
    asset_description: '',
    asset_tags: [],
    endpoint_hostname: '',
    endpoint_ips: [],
    endpoint_last_seen: undefined,
    endpoint_mac_adresses: [],
    endpoint_platform: undefined,
  },
}) => {
  // Standard hooks
  const { t } = useFormatter();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<EndpointInput>({
    mode: 'onTouched',
    resolver: zodResolver(
      zodImplement<EndpointInput>().with({
        asset_name: z.string().min(1, { message: t('Should not be empty') }),
        asset_description: z.string().optional(),
        asset_tags: z.string().array().optional(),
        endpoint_hostname: z.string().optional(),
        endpoint_ips: z.string().ip({ message: t('Invalid Ip Address') }).array().min(1),
        endpoint_last_seen: z.string().datetime().optional(),
        endpoint_mac_adresses: z
          .string()
          .regex(
            /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})|([0-9a-fA-F]{4}.[0-9a-fA-F]{4}.[0-9a-fA-F]{4})$/,
            t('Invalid MAC address'),
          ).array().optional(),
        // @ts-expect-error: find a better way to handle optional enum
        endpoint_platform: z.enum(['Linux', 'Windows', 'Darwin']).or(z.string())
          .transform((val) => (val === '' ? undefined : val))
          .nullish(),
      }),
    ),
    defaultValues: initialValues,
  });

  return (
    <form id="endpointForm" onSubmit={handleSubmit(onSubmit)}>
      <TextField
        variant="standard"
        fullWidth
        label={t('Name')}
        error={!!errors.asset_name}
        helperText={errors.asset_name?.message}
        inputProps={register('asset_name')}
        InputLabelProps={{ required: true }}
      />
      <TextField
        variant="standard"
        fullWidth
        multiline
        rows={2}
        label={t('Description')}
        style={{ marginTop: 20 }}
        error={!!errors.asset_description}
        helperText={errors.asset_description?.message}
        inputProps={register('asset_description')}
      />
      <TextField
        variant="standard"
        fullWidth
        label={t('Hostname')}
        style={{ marginTop: 20 }}
        error={!!errors.endpoint_hostname}
        helperText={errors.endpoint_hostname?.message}
        inputProps={register('endpoint_hostname')}
      />

      <Controller
        control={control}
        name="endpoint_ips"
        render={({ field: { onChange, onBlur, value } }) => {
          const value2 = value?.reduce((accumulator: string, current: string) => (accumulator === '' ? current : `${accumulator}\n${current}`), '');
          const onChange2: FormEventHandler<HTMLTextAreaElement | HTMLInputElement> = (event) => {
            if (event.currentTarget.value === '') {
              setValue('endpoint_ips', []);
              trigger('endpoint_ips');
            } else {
              onChange(event.currentTarget.value.split('\n'));
            }
          };
          return (
            <>
              <TextField
                variant="standard"
                fullWidth
                multiline
                rows={3}
                label={t('Ip Addresses')}
                style={{ marginTop: 20 }}
                error={!!errors.endpoint_ips}
                helperText={errors.endpoint_ips?.reduce?.((accumulator, current, index) => `${accumulator !== '' ? `${accumulator}, ` : ''}${index + 1} - ${current?.message}`, '')}
                inputProps={{
                  onChange: onChange2,
                  onBlur,
                  value: value2,
                }}
                InputLabelProps={{ required: true }}
              />
              <FormHelperText>{t('Please provide one IP address per line.')}</FormHelperText>
            </>
          );
        }}
      />

      <Controller
        control={control}
        name="endpoint_last_seen"
        render={({ field }) => (
          <MuiDateTimePicker
            value={field.value ? new Date(field.value) : ''}
            label={t('Last Seen')}
            slotProps={{
              textField: {
                variant: 'standard',
                fullWidth: true,
                style: { marginTop: 20 },
                error: !!errors.endpoint_last_seen,
                helperText: errors.endpoint_last_seen && errors.endpoint_last_seen?.message,
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
        name="endpoint_mac_adresses"
        render={({ field: { onChange, onBlur, value } }) => {
          const value2 = value?.reduce((accumulator: string, current: string) => (accumulator === '' ? current : `${accumulator}\n${current}`), '');
          const onChange2: FormEventHandler<HTMLTextAreaElement | HTMLInputElement> = (event) => {
            if (event.currentTarget.value === '') {
              setValue('endpoint_mac_adresses', []);
              trigger('endpoint_mac_adresses');
            } else {
              onChange(event.currentTarget.value.split('\n'));
            }
          };
          return (
            <>
              <TextField
                variant="standard"
                fullWidth
                multiline
                rows={3}
                label={t('MAC Addresses')}
                style={{ marginTop: 20 }}
                error={!!errors.endpoint_mac_adresses}
                helperText={errors.endpoint_mac_adresses?.reduce?.((accumulator, current, index) => `${accumulator !== '' ? `${accumulator}, ` : ''}${index + 1} - ${current?.message}`, '')}
                inputProps={{
                  onChange: onChange2,
                  onBlur,
                  value: value2,
                }}
              />
              <FormHelperText>{t('Please provide one MAC address per line.')}</FormHelperText>
            </>
          );
        }}
      />

      <Controller
        control={control}
        name="endpoint_platform"
        render={({ field }) => (
          <TextField
            select
            variant="standard"
            fullWidth
            value={field.value}
            label={t('Platform')}
            style={{ marginTop: 20 }}
            error={!!errors.endpoint_platform}
            helperText={errors.endpoint_platform?.message}
            inputProps={register('endpoint_platform')}
          >
            <MenuItem value={''}>{t('No value')}</MenuItem>
            <MenuItem value={'Linux'}>{t('Linux')}</MenuItem>
            <MenuItem value={'Windows'}>{t('Windows')}</MenuItem>
            <MenuItem value={'Darwin'}>{t('Darwin')}</MenuItem>
          </TextField>
        )}
      />

      <Controller
        control={control}
        name="asset_tags"
        render={({ field: { onChange, value } }) => (
          <TagField
            name="asset_tags"
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
          {editing ? t('Update') : t('Create')}
        </Button>
      </div>
    </form>
  );
};

export default EndpointForm;
