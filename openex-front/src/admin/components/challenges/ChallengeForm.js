import React from 'react';
import { Form } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import { FieldArray } from 'react-final-form-arrays';
import Button from '@mui/material/Button';
import { ListItem } from '@mui/material';
import List from '@mui/material/List';
import MenuItem from '@mui/material/MenuItem';
import { TextField } from '../../../components/TextField';
import { useFormatter } from '../../../components/i18n';
import { Select } from '../../../components/Select';

const ChallengeForm = (props) => {
  const { t } = useFormatter();
  const { onSubmit, handleClose, initialValues, editing } = props;
  // Functions
  const validate = (values) => {
    const errors = {};
    const requiredFields = ['challenge_name'];
    requiredFields.forEach((field) => {
      if (!values[field]) {
        errors[field] = t('This field is required.');
      }
    });
    return errors;
  };
  const required = (value) => (value ? undefined : t('This field is required.'));
  const requiredArray = (value) => (value && value.length > 0 ? undefined : t('This field is required.'));
  // Rendering
  return (
    <Form
      keepDirtyOnReinitialize={true}
      initialValues={initialValues}
      onSubmit={onSubmit}
      validate={validate}
      mutators={{
        ...arrayMutators,
        setValue: ([field, value], state, { changeValue }) => {
          changeValue(state, field, () => value);
        },
      }}
    >
      {({ handleSubmit, submitting, pristine, errors }) => (
        <form id="challengeForm" onSubmit={handleSubmit}>
          <TextField
            variant="standard"
            name="challenge_name"
            fullWidth={true}
            label={t('Name')}
          />
          <TextField
            variant="standard"
            name="challenge_description"
            fullWidth={true}
            label={t('Description')}
          />
          <FieldArray name="challenge_flags" validate={requiredArray}>
            {({ fields }) => (
              <List>
                {fields.map((name, index) => (
                  <ListItem key={`flag_index_${index}`}>
                    <Select
                      variant="standard"
                      name={`${name}.flag_type`}
                      label={t('Flag type')}
                      fullWidth={true}
                      style={{ marginTop: 20 }}
                    >
                      <MenuItem key="VALUE" value="VALUE">
                        {t('Text')}
                      </MenuItem>
                      <MenuItem key="VALUE_CASE" value="VALUE_CASE">
                        {t('Text (sensitive)')}
                      </MenuItem>
                      <MenuItem key="REGEXP" value="REGEXP">
                        {t('Regexp')}
                      </MenuItem>
                    </Select>
                    <TextField
                      variant="standard"
                      name={`${name}.flag_value`}
                      validate={required}
                      fullWidth={true}
                      label={t('Value')}
                    />
                    <Button
                      type="button"
                      color="secondary"
                      onClick={() => fields.remove(index)}
                    >
                      X
                    </Button>
                  </ListItem>
                ))}
                <Button
                  type="button"
                  color="secondary"
                  onClick={() => fields.push({ flag_type: 'VALUE', flag_value: '' })
                  }
                >
                  {t('Add')}
                </Button>
              </List>
            )}
          </FieldArray>
          {errors.challenge_flags && errors.challenge_flags.length === 0 && (
            <div>{t('A list of flags is required')}</div>
          )}
          <div style={{ float: 'right', marginTop: 20 }}>
            <Button
              onClick={handleClose}
              style={{ marginRight: 10 }}
              disabled={submitting}
            >
              {t('Cancel')}
            </Button>
            <Button
              color="secondary"
              type="submit"
              disabled={
                pristine || submitting || Object.keys(errors).length > 0
              }
            >
              {editing ? t('Update') : t('Create')}
            </Button>
          </div>
        </form>
      )}
    </Form>
  );
};

export default ChallengeForm;
