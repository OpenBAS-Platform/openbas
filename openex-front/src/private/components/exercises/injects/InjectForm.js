import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Form } from 'react-final-form';
import * as R from 'ramda';
import MenuItem from '@mui/material/MenuItem';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { TextField } from '../../../../components/TextField';
import { Select } from '../../../../components/Select';
import { i18nRegister } from '../../../../utils/Messages';
import { T } from '../../../../components/I18n';

i18nRegister({
  fr: {
    Title: 'Titre',
    Description: 'Description',
    'Inject date': "Date de l'inject",
    Type: 'Type',
    openex_ovh_sms: 'SMS (OVH)',
    openex_email: 'Email',
    openex_manual: 'Manuel',
  },
  en: {
    openex_ovh_sms: 'SMS (OVH)',
    openex_email: 'Email',
    openex_manual: 'Manual',
  },
});

const validate = (values) => {
  const errors = {};
  const requiredFields = [
    'inject_title',
    'inject_description',
    'inject_depends_duration',
    'inject_type',
  ];
  requiredFields.forEach((field) => {
    if (!values[field]) {
      errors[field] = 'Required';
    }
  });
  return errors;
};

class InjectForm extends Component {
  render() {
    const { onSubmit, initialValues } = this.props;
    return (
      <Form
        initialValues={initialValues}
        onSubmit={onSubmit}
        validate={validate}
      >
        {({ handleSubmit }) => (
          <form id="injectForm" onSubmit={handleSubmit}>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <TextField name="inject_title" fullWidth={true} label="Title" />
              <TextField
                name="inject_depends_duration"
                label={<T>Inject delay</T>}
                fullWidth={true}
                type="number"
                style={{ marginTop: 20 }}
              />
              <TextField
                name="inject_description"
                fullWidth={true}
                multiline={true}
                rows={3}
                label={<T>Description</T>}
                style={{ marginTop: 20 }}
              />
              <Select
                name="inject_type"
                label={<T>Type</T>}
                fullWidth={true}
                onChange={this.props.onInjectTypeChange}
                style={{ marginTop: 20 }}
              >
                {R.values(this.props.types).map((data) => (
                  <MenuItem key={data.type} value={data.type}>
                    <T>{data.type}</T>
                  </MenuItem>
                ))}
              </Select>
            </MuiPickersUtilsProvider>
          </form>
        )}
      </Form>
    );
  }
}

InjectForm.propTypes = {
  error: PropTypes.string,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func,
  change: PropTypes.func,
  onInjectTypeChange: PropTypes.func,
  types: PropTypes.object,
};

export default InjectForm;
