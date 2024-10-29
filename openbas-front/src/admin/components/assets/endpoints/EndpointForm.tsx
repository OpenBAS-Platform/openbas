import { zodResolver } from '@hookform/resolvers/zod';
import { Button, FormHelperText, MenuItem, TextField } from '@mui/material';
import { DateTimePicker as MuiDateTimePicker } from '@mui/x-date-pickers';
import { FormEventHandler, SyntheticEvent } from 'react';
import * as React from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

import TagField from '../../../../components/fields/TagField';
import { useFormatter } from '../../../../components/i18n';
import type { EndpointInput } from '../../../../utils/api-types';
import { zodImplement } from '../../../../utils/Zod';

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
    asset_last_seen: null,
    asset_tags: [],
    endpoint_hostname: '',
    endpoint_ips: [],
    endpoint_mac_addresses: [],
    endpoint_platform: undefined,
    endpoint_arch: 'x86_64',
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
        asset_last_seen: z.string().datetime().optional().nullable(),
        asset_tags: z.string().array().optional(),
        endpoint_hostname: z.string().optional(),
        endpoint_ips: z.string().ip({ message: t('Invalid IP addresses') }).array().min(1),
        endpoint_mac_addresses: z
          .string()
          .regex(
            /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})|([0-9a-fA-F]{4}.[0-9a-fA-F]{4}.[0-9a-fA-F]{4})$/,
            t('Invalid MAC addresses'),
          ).array().optional(),
        endpoint_platform: z.enum(['Linux', 'Windows', 'MacOS', 'Service', 'Generic', 'Internal']),
        endpoint_arch: z.enum(['x86_64', 'arm64', 'Unknown']),
        endpoint_agent_version: z.string().optional(),
      }),
    ),
    defaultValues: initialValues,
  });

  const handleSubmitWithoutPropagation = (e: SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleSubmit(onSubmit)(e);
  };

  return (
    <form id="endpointForm" onSubmit={handleSubmitWithoutPropagation}>
      <TextField
        variant="standard"
        fullWidth
        label={t('Name')}
        style={{ marginTop: 10 }}
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
      <Controller
        control={control}
        name="asset_last_seen"
        render={({ field }) => (
          <MuiDateTimePicker
            value={field.value ? new Date(field.value) : null}
            label={t('Last Seen')}
            slotProps={{
              textField: {
                variant: 'standard',
                fullWidth: true,
                style: { marginTop: 20 },
                error: !!errors.asset_last_seen,
                helperText: errors.asset_last_seen?.message,
              },
            }}
            onChange={date => field.onChange(date?.toISOString())}
            ampm={false}
            format="yyyy-MM-dd HH:mm:ss"
          />
        )}
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
                label={t('IP Addresses')}
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
        name="endpoint_mac_addresses"
        render={({ field: { onChange, onBlur, value } }) => {
          const value2 = value?.reduce((accumulator: string, current: string) => (accumulator === '' ? current : `${accumulator}\n${current}`), '');
          const onChange2: FormEventHandler<HTMLTextAreaElement | HTMLInputElement> = (event) => {
            if (event.currentTarget.value === '') {
              setValue('endpoint_mac_addresses', []);
              trigger('endpoint_mac_addresses');
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
                error={!!errors.endpoint_mac_addresses}
                helperText={errors.endpoint_mac_addresses?.reduce?.((accumulator, current, index) => `${accumulator !== '' ? `${accumulator}, ` : ''}${index + 1} - ${current?.message}`, '')}
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
            InputLabelProps={{ required: true }}
          >
            <MenuItem value="Linux">{t('Linux')}</MenuItem>
            <MenuItem value="Windows">{t('Windows')}</MenuItem>
            <MenuItem value="MacOS">{t('MacOS')}</MenuItem>
          </TextField>
        )}
      />
      <Controller
        control={control}
        name="endpoint_arch"
        render={({ field }) => (
          <TextField
            select
            variant="standard"
            fullWidth
            value={field.value}
            label={t('Architecture')}
            style={{ marginTop: 20 }}
            error={!!errors.endpoint_arch}
            helperText={errors.endpoint_arch?.message}
            inputProps={register('endpoint_arch')}
            InputLabelProps={{ required: true }}
          >
            <MenuItem value="x86_64">{t('x86_64')}</MenuItem>
            <MenuItem value="arm64">{t('arm64')}</MenuItem>
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
          variant="contained"
          onClick={handleClose}
          style={{ marginRight: 10 }}
          disabled={isSubmitting}
        >
          {t('Cancel')}
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

export default EndpointForm;
