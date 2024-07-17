import { Autocomplete as MuiAutocomplete, Box, Button, MenuItem, TextField } from '@mui/material';
import { TableViewOutlined } from '@mui/icons-material';
import React, { FunctionComponent, SyntheticEvent, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import moment from 'moment-timezone';
import { makeStyles } from '@mui/styles';
import { zodImplement } from '../../../../utils/Zod';
import { useFormatter } from '../../../../components/i18n';
import type { ImportMapper, InjectsImportInput } from '../../../../utils/api-types';
import { searchMappers } from '../../../../actions/xls_formatter/xls-formatter-actions';
import type { Page } from '../../../../components/common/pagination/Page';

const useStyles = makeStyles(() => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  buttons: {
    display: 'flex',
    justifyContent: 'right',
    gap: '8px',
    marginTop: '24px',
  },
  option: {
    display: 'flex',
    gap: '8px',
    margin: '4px 8px',
    cursor: 'pointer',
  },
}));

interface FormProps {
  sheetName: string;
  importMapperId: string;
  timezone: string;
}

interface Props {
  sheets: string[];
  handleClose: () => void;
  handleSubmit: (input: InjectsImportInput) => void;
}

const ImportUploaderInjectImportInjects: FunctionComponent<Props> = ({
  sheets,
  handleClose,
  handleSubmit,
}) => {
  // Standard hooks
  const { t } = useFormatter();
  const classes = useStyles();

  // TimeZone
  const timezones = moment.tz.names();

  // Form
  const {
    register,
    control,
    handleSubmit: handleSubmitForm,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<FormProps>({
    mode: 'onTouched',
    resolver: zodResolver(
      zodImplement<FormProps>().with({
        sheetName: z.string().min(1, { message: t('Should not be empty') }),
        importMapperId: z.string().min(1, { message: t('Should not be empty') }),
        timezone: z.string().min(1, { message: t('Should not be empty') }),
      }),
    ),
    defaultValues: {
      timezone: moment.tz.guess(),
    },
  });

  // Mapper
  const [mappers, setMappers] = useState<ImportMapper[]>([]);
  useEffect(() => {
    searchMappers({ size: 10 }).then((result: { data: Page<ImportMapper> }) => {
      const { data } = result;
      setMappers(data.content);
    });
  }, []);
  const mapperOptions = mappers.map(
    (m) => ({
      id: m.import_mapper_id,
      label: m.import_mapper_name,
    }),
  );

  const onSubmitImportInjects = (values: FormProps) => {
    const input: InjectsImportInput = {
      import_mapper_id: values.importMapperId,
      sheet_name: values.sheetName,
      timezone_offset: moment.tz(values.timezone).utcOffset(),
    };
    handleSubmit(input);
  };

  const handleSubmitWithoutPropagation = (e: SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleSubmitForm(onSubmitImportInjects)(e);
  };

  return (
    <form id="importUploadInjectForm" onSubmit={handleSubmitWithoutPropagation}>
      <div className={classes.container}>
        <Controller
          control={control}
          name="sheetName"
          render={({ field: { onChange } }) => (
            <MuiAutocomplete
              size="small"
              selectOnFocus
              autoHighlight
              clearOnBlur={false}
              clearOnEscape={false}
              options={sheets}
              onChange={(_, v) => {
                onChange(v);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={'Sheet'}
                  variant="standard"
                  fullWidth
                  error={!!errors.sheetName}
                  helperText={errors.sheetName?.message}
                  InputLabelProps={{ required: true }}
                />
              )}
            />
          )}
        />
        <Controller
          control={control}
          name="importMapperId"
          render={({ field: { onChange } }) => (
            <MuiAutocomplete
              size="small"
              selectOnFocus
              autoHighlight
              clearOnBlur={false}
              clearOnEscape={false}
              options={mapperOptions}
              onChange={(_, v) => {
                onChange(v?.id);
              }}
              renderOption={(props, option) => (
                <Box component="li" {...props} key={option.id} className={classes.option}>
                  <TableViewOutlined color="primary" />
                  <div>{option.label}</div>
                </Box>
              )}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, v) => option.id === v.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={'Mapper'}
                  variant="standard"
                  fullWidth
                  error={!!errors.importMapperId}
                  helperText={errors.importMapperId?.message}
                  InputLabelProps={{ required: true }}
                />
              )}
            />
          )}
        />
        <Controller
          control={control}
          name="timezone"
          render={({ field }) => (
            <TextField
              select
              variant="standard"
              fullWidth
              value={field.value}
              label={t('Timezone')}
              error={!!errors.timezone}
              helperText={errors.timezone?.message}
              inputProps={register('timezone')}
            >{timezones.map((tz) => (
              <MenuItem key={tz} value={tz}>{t(tz)}</MenuItem>
            ))}
            </TextField>
          )}
        />
      </div>
      <div className={classes.buttons}>
        <Button
          onClick={handleClose}
          disabled={isSubmitting}
        >
          {t('Cancel')}
        </Button>
        <Button
          color="secondary"
          type="submit"
          disabled={!isDirty || isSubmitting}
        >
          {t('Launch import')}
        </Button>
      </div>
    </form>
  );
};

export default ImportUploaderInjectImportInjects;
