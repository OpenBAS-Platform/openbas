import { Autocomplete as MuiAutocomplete, Box, Button, MenuItem, TextField } from '@mui/material';
import React, { FunctionComponent, SyntheticEvent, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import moment from 'moment-timezone';
import { makeStyles } from '@mui/styles';
import { zodImplement } from '../../../../utils/Zod';
import { useFormatter } from '../../../../components/i18n';
import type { ImportMapperAddInput, ImportPostSummary, ImportTestSummary } from '../../../../utils/api-types';
import { InjectsImportTestInput, textXls } from '../../../../actions/scenarios/scenario-actions';
import CodeBlock from '../../../../components/common/CodeBlock';

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
}));

interface FormProps {
  sheetName: string;
  timezone: string;
}

interface Props {
  exerciseOrScenarioId: string;
  importId: string;
  sheets: string[];
  importMapperValues: ImportMapperAddInput;
  handleClose: () => void;
}

const ImportUploaderInjectImportInjectsTest: FunctionComponent<Props> = ({
  exerciseOrScenarioId,
  importId,
  sheets,
  importMapperValues,
  handleClose,
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
        timezone: z.string().min(1, { message: t('Should not be empty') }),
      }),
    ),
    defaultValues: {
      timezone: moment.tz.guess(),
    },
  });

  const [result, setResult] = useState<ImportTestSummary | undefined>(undefined);

  const onSubmitImportTest = (values: FormProps) => {
    const input: InjectsImportTestInput = {
      import_mapper: importMapperValues,
      sheet_name: values.sheetName,
      timezone_offset: moment.tz(values.timezone).utcOffset(),
    };
    textXls(exerciseOrScenarioId, importId, input).then((result: { data: ImportPostSummary }) => {
      const { data } = result;
      setResult(data);
    });
  };

  const handleSubmitWithoutPropagation = (e: SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleSubmitForm(onSubmitImportTest)(e);
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
      {result
        && <Box
          sx={{
            paddingTop: '8px',
            fontSize: '1rem',
            gap: '8px',
            justifyContent: 'center',
            display: 'flex',
          }}
           >
          <>
            <span>{t('Import Message')} : </span>
            {result?.import_message?.forEach((m) => (
              <>
                <span>{m.message_level}</span>
                <span>{m.message_code}</span>
              </>
            ))
            }
          </>
        </Box>
      }
      <Box sx={{ marginTop: '8px' }}>
        <CodeBlock
          code={JSON.stringify(result?.injects) || t('You will find here the result in JSON format.')}
          language={'json'}
        />
      </Box>
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
          {t('Test')}
        </Button>
      </div>
    </form>
  );
};

export default ImportUploaderInjectImportInjectsTest;
