import React from 'react';
import * as PropTypes from 'prop-types';
import { Form } from 'react-final-form';
import { Button, MenuItem } from '@mui/material';
import OldTextField from '../../../../components/OldTextField';
import { useFormatter } from '../../../../components/i18n';
import SelectField from '../../../../components/fields/SelectField';
import TagField from '../../../../components/TagField';

const PayloadForm = (props) => {
  const { onSubmit, initialValues, editing, handleClose } = props;
  const { t } = useFormatter();
  const validate = (values) => {
    const errors = {};
    const requiredFields = ['payload_type', 'payload_name', 'payload_content'];
    requiredFields.forEach((field) => {
      if (!values[field]) {
        errors[field] = t('This field is required.');
      }
    });
    return errors;
  };
  return (
    <Form
      keepDirtyOnReinitialize={true}
      initialValues={initialValues}
      onSubmit={onSubmit}
      validate={validate}
      mutators={{
        setValue: ([field, value], state, { changeValue }) => {
          changeValue(state, field, () => value);
        },
      }}
    >
      {({ handleSubmit, form, values, submitting, pristine }) => (
        <form id="payloadForm" onSubmit={handleSubmit}>
          <SelectField
            variant="standard"
            label={t('Type')}
            name="payload_type"
            fullWidth={true}
            style={{ marginTop: 10 }}
          >
            <MenuItem key="windows_command_line" value="windows_command_line">
              {t('Windows Command Line')}
            </MenuItem>
            <MenuItem key="windows_powershell" value="windows_powershell">
              {t('Windows Powershell')}
            </MenuItem>
          </SelectField>
          <OldTextField
            name="payload_name"
            fullWidth={true}
            label={t('Name')}
            style={{ marginTop: 20 }}
          />
          <OldTextField
            name="payload_description"
            multiline={true}
            fullWidth={true}
            rows={3}
            label={t('Description')}
            style={{ marginTop: 20 }}
          />
          <OldTextField
            name="payload_content"
            multiline={true}
            fullWidth={true}
            rows={3}
            label={t('Content')}
            style={{ marginTop: 20 }}
          />
          <TagField
            name="payload_tags"
            label={t('Tags')}
            values={values}
            setFieldValue={form.mutators.setValue}
            style={{ marginTop: 20 }}
          />
          <div style={{ float: 'right', marginTop: 20 }}>
            <Button
              variant="contained"
              onClick={handleClose}
              style={{ marginRight: 10 }}
              disabled={submitting}
            >
              {t('Cancel')}
            </Button>
            <Button
              variant="contained"
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

PayloadForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  handleClose: PropTypes.func,
  editing: PropTypes.bool,
};

export default PayloadForm;
