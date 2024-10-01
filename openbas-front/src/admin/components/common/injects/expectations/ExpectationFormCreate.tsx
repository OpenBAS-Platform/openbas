import React, { FunctionComponent, SyntheticEvent, useEffect } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Alert, Button, InputLabel, MenuItem, Select as MUISelect, TextField, TextField as MuiTextField, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ExpectationInput, ExpectationInputForm } from './Expectation';
import { formProps, infoMessage } from './ExpectationFormUtils';
import { useFormatter } from '../../../../../components/i18n';
import type { Theme } from '../../../../../components/Theme';
import ExpectationGroupField from './field/ExpectationGroupField';
import { isTechnicalExpectation } from './ExpectationUtils';
import ScaleBar from '../../../../../components/scalebar/ScaleBar';
import { splitDuration } from '../../../../../utils/Time';
import useExpectationExpirationTime from './useExpectationExpirationTime';

const useStyles = makeStyles((theme: Theme) => ({
  marginTop_2: {
    marginTop: theme.spacing(2),
  },
  buttons: {
    display: 'flex',
    placeContent: 'end',
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  duration: {
    marginTop: 20,
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    border: `1px solid ${theme.palette.primary.main}`,
    borderRadius: 4,
    padding: 15,
  },
  trigger: {
    fontFamily: 'Consolas, monaco, monospace',
    fontSize: 12,
    paddingTop: 15,
    color: theme.palette.primary.main,
  },
}));

interface Props {
  predefinedExpectations: ExpectationInput[];
  onSubmit: SubmitHandler<ExpectationInputForm>;
  handleClose: () => void;
}

const ExpectationFormCreate: FunctionComponent<Props> = ({
  predefinedExpectations = [],
  onSubmit,
  handleClose,
}) => {
  const { t } = useFormatter();
  const classes = useStyles();

  const manualExpectationExpirationTime = useExpectationExpirationTime('MANUAL');

  const computeValuesFromType = (type: string): ExpectationInputForm => {
    const predefinedExpectation = predefinedExpectations.filter((pe) => pe.expectation_type === type)[0];
    if (predefinedExpectation) {
      const expirationTime = splitDuration(predefinedExpectation.expectation_expiration_time || 0);
      return {
        expectation_type: predefinedExpectation.expectation_type ?? '',
        expectation_name: predefinedExpectation.expectation_name ?? '',
        expectation_description: predefinedExpectation.expectation_description ?? '',
        expectation_score: predefinedExpectation.expectation_score > 0 ? predefinedExpectation.expectation_score : 100,
        expectation_expectation_group: predefinedExpectation.expectation_expectation_group ?? false,
        expiration_time_days: parseInt(expirationTime.days, 10),
        expiration_time_hours: parseInt(expirationTime.hours, 10),
        expiration_time_minutes: parseInt(expirationTime.minutes, 10),
      };
    }
    const expirationTime = splitDuration(manualExpectationExpirationTime || 0);
    return {
      expectation_type: 'MANUAL',
      expectation_name: '',
      expectation_description: '',
      expectation_score: 100,
      expectation_expectation_group: false,
      expiration_time_days: parseInt(expirationTime.days, 10),
      expiration_time_hours: parseInt(expirationTime.hours, 10),
      expiration_time_minutes: parseInt(expirationTime.minutes, 10),
    };
  };

  const predefinedTypes = predefinedExpectations.map((e) => e.expectation_type);
  const initialValues: ExpectationInputForm = computeValuesFromType(predefinedTypes[0]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    watch,
    reset,
    getValues,
  } = useForm<ExpectationInputForm>(formProps(initialValues, t));
  const { control } = useForm<ExpectationInput>();
  const watchType = watch('expectation_type');

  const handleSubmitWithoutPropagation = (e: SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleSubmit(onSubmit)(e);
  };

  useEffect(() => {
    reset(computeValuesFromType(watchType));
  }, [watchType]);

  return (
    <form id="expectationForm" onSubmit={handleSubmitWithoutPropagation}>
      <div>
        <InputLabel id="input-type">{t('Type')}</InputLabel>
        <MUISelect
          labelId="input-type"
          value={getValues().expectation_type}
          variant="standard"
          fullWidth
          error={!!errors.expectation_type}
          inputProps={register('expectation_type')}
        >
          {predefinedTypes.map((type) => (<MenuItem key={type} value={type}>{t(type)}</MenuItem>))}
          <MenuItem key={'MANUAL'} value={'MANUAL'}>{t('MANUAL')}</MenuItem>
        </MUISelect>
      </div>
      {(watchType === 'ARTICLE' || watchType === 'CHALLENGE')
        && <Alert
          severity="info"
          className={classes.marginTop_2}
           >
          {infoMessage(getValues().expectation_type, t)}
        </Alert>
      }
      <MuiTextField
        variant="standard"
        fullWidth
        label={t('Name')}
        className={classes.marginTop_2}
        error={!!errors.expectation_name}
        helperText={
          errors.expectation_name && errors.expectation_name?.message
        }
        inputProps={register('expectation_name')}
        InputLabelProps={{ required: true }}
      />
      <MuiTextField
        variant="standard"
        fullWidth
        label={t('Description')}
        className={classes.marginTop_2}
        multiline
        error={!!errors.expectation_description}
        helperText={
          errors.expectation_description && errors.expectation_description?.message
        }
        inputProps={register('expectation_description')}
      />
      <div className={classes.duration}>
        <div className={classes.trigger}>
          {t('Expiration time')}
        </div>
        <TextField
          variant="standard"
          type="number"
          label={t('Days')}
          style={{ width: '20%' }}
          inputProps={register('expiration_time_days')}
        />
        <TextField
          variant="standard"
          inputProps={register('expiration_time_hours')}
          type="number"
          label={t('Hours')}
          style={{ width: '20%' }}
        />
        <TextField
          variant="standard"
          inputProps={register('expiration_time_minutes')}
          type="number"
          label={t('Minutes')}
          style={{ width: '20%' }}
        />
      </div>
      <div style={{ marginTop: 20 }}>
        <Typography variant="h4">{t('Scores')}</Typography>
        <ScaleBar expectationScore={watch('expectation_score')} />
      </div>

      <MuiTextField
        variant="standard"
        fullWidth
        label={t('Success score')}
        type="number"
        className={classes.marginTop_2}
        error={!!errors.expectation_score}
        helperText={
          errors.expectation_score && errors.expectation_score?.message
        }
        {...register('expectation_score')}
        InputProps={{
          inputProps: {
            min: 0,
            max: 100,
          },
        }}
      />
      <ExpectationGroupField isTechnicalExpectation={isTechnicalExpectation(watchType)} control={control} />
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
          disabled={!isValid || isSubmitting}
        >
          {t('Create')}
        </Button>
      </div>
    </form>
  );
};

export default ExpectationFormCreate;
