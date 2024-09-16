import React, { FunctionComponent, SyntheticEvent, useEffect } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Alert, Button, InputLabel, MenuItem, Select as MUISelect, TextField as MuiTextField, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import type { ExpectationInput } from './Expectation';
import { formProps, infoMessage } from './ExpectationFormUtils';
import { useFormatter } from '../../../../../components/i18n';
import type { Theme } from '../../../../../components/Theme';
import ExpectationGroupField from './field/ExpectationGroupField';
import { isTechnicalExpectation } from './ExpectationUtils';
import ScaleBar from '../../../../../components/scalebar/ScaleBar';

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
}));

interface Props {
  predefinedExpectations: ExpectationInput[];
  onSubmit: SubmitHandler<ExpectationInput>;
  handleClose: () => void;
}

const ExpectationFormCreate: FunctionComponent<Props> = ({
  predefinedExpectations = [],
  onSubmit,
  handleClose,
}) => {
  const { t } = useFormatter();
  const classes = useStyles();

  const computeValuesFromType = (type: string) => {
    const predefinedExpectation = predefinedExpectations.filter((pe) => pe.expectation_type === type)[0];
    if (predefinedExpectation) {
      return {
        expectation_type: predefinedExpectation.expectation_type ?? '',
        expectation_name: predefinedExpectation.expectation_name ?? '',
        expectation_description: predefinedExpectation.expectation_description ?? '',
        expectation_score: predefinedExpectation.expectation_score > 0 ? predefinedExpectation.expectation_score : 100,
        expectation_expectation_group: predefinedExpectation.expectation_expectation_group ?? false,
      };
    }
    return {
      expectation_type: 'MANUAL',
      expectation_name: '',
      expectation_description: '',
      expectation_score: 100,
      expectation_expectation_group: false,
    };
  };

  const predefinedTypes = predefinedExpectations.map((e) => e.expectation_type);
  const initialValues = computeValuesFromType(predefinedTypes[0]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    watch,
    reset,
    getValues,
    control,
  } = useForm<ExpectationInput>(formProps(initialValues, t));
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
      <div style={{ marginTop: 20 }}>
        <Typography variant="h4">{t('Scores')}</Typography>
        <ScaleBar expectationScore={watch('expectation_score')} />
      </div>

      <MuiTextField
        variant="standard"
        fullWidth
        label={t('Score')}
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
