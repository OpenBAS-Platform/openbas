import { Form } from 'react-final-form';
import Button from '@mui/material/Button';
import React from 'react';
import { Config } from 'final-form';
import { TextField } from '../../../../components/TextField';
import { useFormatter } from '../../../../components/i18n';
import { Variable } from '../../../../utils/api-types';

export type Values = Pick<Variable, 'variable_key' | 'variable_description' | 'variable_value'>;

interface Props {
  onSubmit: Config<Values>['onSubmit']
  handleClose: () => void,
  editing?: boolean,
  initialValues?: Values
}

const VariableForm: React.FC<Props> = ({ onSubmit, handleClose, editing, initialValues }) => {
  // Standard hooks
  const { t } = useFormatter();

  const validate: Config<Values>['validate'] = (values) => {
    const errors: Partial<Values> = {};
    const requiredFields = ['variable_key'];
    requiredFields.forEach((field) => {
      const value = values[field as keyof Values];
      if (!value) {
        errors[field as keyof Values] = t('This field is required.');
      }
    });
    return errors;
  };

  return (
    <Form<Values>
      initialValues={initialValues}
      keepDirtyOnReinitialize={true}
      onSubmit={onSubmit}
      validate={validate}
      mutators={{
        setValue: ([field, value], state, { changeValue }) => {
          changeValue(state, field, () => value);
        },
      }}
    >
      {({ handleSubmit, form, values, submitting, pristine }) => (
        <form id="audienceForm" onSubmit={handleSubmit}>
          <TextField
            variant="standard"
            name="variable_key"
            fullWidth={true}
            label={t('Key')}
          />
          <TextField
            variant="standard"
            name="variable_description"
            fullWidth={true}
            multiline={true}
            rows={2}
            label={t('Description')}
            style={{ marginTop: 20 }}
          />
          <TextField
            variant="standard"
            name="variable_value"
            fullWidth={true}
            label={t('Value')}
          />
          <div style={{ float: 'right', marginTop: 20 }}>
            <Button
              onClick={handleClose.bind(this)}
              style={{ marginRight: 10 }}
              disabled={submitting}
            >
              {t('Cancel')}
            </Button>
            <Button
              color="secondary"
              type="submit"
              disabled={pristine || submitting}
            >
              {editing ? t('Update') : t('Create')}
            </Button>
          </div>
        </form>
      )}
    </Form>
  );
};

export default VariableForm;
