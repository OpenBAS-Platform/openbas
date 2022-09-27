import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Form } from 'react-final-form';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import { Select } from '../../../components/Select';
import { TextField } from '../../../components/TextField';
import inject18n from '../../../components/i18n';
import OrganizationField from '../../../components/OrganizationField';
import CountryField from '../../../components/CountryField';

class UserForm extends Component {
  validate(values) {
    const { t } = this.props;
    const errors = {};
    const requiredFields = ['user_email'];
    requiredFields.forEach((field) => {
      if (!values[field]) {
        errors[field] = t('This field is required.');
      }
    });
    return errors;
  }

  render() {
    const { t, onSubmit, initialValues } = this.props;
    return (
      <Form
        keepDirtyOnReinitialize={true}
        onSubmit={onSubmit}
        initialValues={initialValues}
        validate={this.validate.bind(this)}
        mutators={{
          setValue: ([field, value], state, { changeValue }) => {
            changeValue(state, field, () => value);
          },
        }}
      >
        {({ form, handleSubmit, pristine, submitting, values }) => (
          <form id="userForm" onSubmit={handleSubmit}>
            <TextField
              variant="standard"
              name="user_email"
              fullWidth={true}
              label={t('Email address')}
            />
            <TextField
              variant="standard"
              name="user_firstname"
              fullWidth={true}
              label={t('Firstname')}
              style={{ marginTop: 20 }}
            />
            <TextField
              variant="standard"
              name="user_lastname"
              fullWidth={true}
              label={t('Lastname')}
              style={{ marginTop: 20 }}
            />
            <OrganizationField
              name="user_organization"
              values={values}
              setFieldValue={form.mutators.setValue}
            />
            <CountryField
              name="user_country"
              values={values}
              setFieldValue={form.mutators.setValue}
            />
            <Select
              variant="standard"
              label={t('Theme')}
              name="user_theme"
              fullWidth={true}
              style={{ marginTop: 20 }}
            >
              <MenuItem key="default" value="default">
                {t('Default')}
              </MenuItem>
              <MenuItem key="dark" value="dark">
                {t('Dark')}
              </MenuItem>
              <MenuItem key="light" value="light">
                {t('Light')}
              </MenuItem>
            </Select>
            <Select
              variant="standard"
              label={t('Language')}
              name="user_lang"
              fullWidth={true}
              style={{ marginTop: 20 }}
            >
              <MenuItem key="auto" value="auto">
                {t('Automatic')}
              </MenuItem>
              <MenuItem key="en" value="en">
                English
              </MenuItem>
              <MenuItem key="fr" value="fr">
                Français
              </MenuItem>
            </Select>
            <div style={{ marginTop: 20 }}>
              <Button
                variant="contained"
                color="secondary"
                type="submit"
                disabled={pristine || submitting}
              >
                {t('Update')}
              </Button>
            </div>
          </form>
        )}
      </Form>
    );
  }
}

UserForm.propTypes = {
  t: PropTypes.func,
  onSubmit: PropTypes.func.isRequired,
};

export default inject18n(UserForm);
