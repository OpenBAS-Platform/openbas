import React, { FunctionComponent, SyntheticEvent } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import MuiTextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useFormatter } from '../../../../../components/i18n';
import { ExpectationInput } from '../../../../../actions/Expectation';
import { Alert, MenuItem } from '@mui/material';
import MUISelect from '@mui/material/Select';
import { formProps, infoMessage } from './ExpectationFormUtils';
import InputLabel from '@mui/material/InputLabel';

interface ExpectationFormProps {
  onSubmit: SubmitHandler<ExpectationInput>;
  handleClose: () => void;
  initialValues: ExpectationInput;
}

const ExpectationFormUpdate: FunctionComponent<ExpectationFormProps> = ({
  onSubmit,
  handleClose,
  initialValues,
}) => {
  const { t } = useFormatter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    getValues,
  } = useForm<ExpectationInput>(formProps(initialValues));

  const handleSubmitWithoutPropagation = (e: SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleSubmit(onSubmit)(e);
  };

  return (
    <form id="expectationForm" onSubmit={handleSubmitWithoutPropagation}>
      <div>
        <InputLabel id="input-type">{t('Type')}</InputLabel>
        <MUISelect
          disabled={true}
          labelId="input-type"
          value={getValues().expectation_type}
          variant="standard"
          fullWidth
          error={!!errors.expectation_type}
          inputProps={register('expectation_type')}
        >
          <MenuItem value={getValues().expectation_type}>{t(getValues().expectation_type)}</MenuItem>
        </MUISelect>
      </div>
      {getValues().expectation_type === 'ARTICLE'
        && <Alert
          severity="info"
          style={{ marginTop: 20 }}>
          {infoMessage(getValues().expectation_type, t)}
        </Alert>
      }
      <MuiTextField
        variant="standard"
        fullWidth
        label={t('Name')}
        style={{ marginTop: 20 }}
        error={!!errors.expectation_name}
        helperText={
          errors.expectation_name && errors.expectation_name?.message
        }
        inputProps={register('expectation_name')}
      />
      <MuiTextField
        variant="standard"
        fullWidth
        label={t('Description')}
        style={{ marginTop: 20 }}
        multiline
        error={!!errors.expectation_description}
        helperText={
          errors.expectation_description && errors.expectation_description?.message
        }
        inputProps={register('expectation_description')}
      />
      <MuiTextField
        variant="standard"
        fullWidth
        label={t('Score')}
        type="number"
        style={{ marginTop: 20 }}
        error={!!errors.expectation_score}
        helperText={
          errors.expectation_score && errors.expectation_score?.message
        }
        inputProps={register('expectation_score')}
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
          disabled={!isValid || isSubmitting}
        >
          {t('Update')}
        </Button>
      </div>
    </form>
  );
};

export default ExpectationFormUpdate;
