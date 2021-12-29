import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Form } from 'react-final-form';
import MenuItem from '@mui/material/MenuItem';
import { Select } from '../../../components/Select';
import { TextField } from '../../../components/TextField';
import { Autocomplete } from '../../../components/Autocomplete';
import inject18n from '../../../components/i18n';

class UserForm extends Component {
  render() {
    const {
      t, onSubmit, organizations, initialValues,
    } = this.props;
    const options = organizations.map(
      (o) => ({ id: o.organization_id, label: o.organization_name }),
    );
    return (
      <Form onSubmit={onSubmit} initialValues={initialValues}>
        {({ handleSubmit }) => (
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
            <Autocomplete
              variant="standard"
              name="user_organization"
              fullWidth={true}
              label={t('Organization')}
              options={options}
              style={{ marginTop: 20 }}
              freeSolo={true}
            />
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
          </form>
        )}
      </Form>
    );
  }
}

UserForm.propTypes = {
  t: PropTypes.func,
  error: PropTypes.string,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func,
  organizations: PropTypes.object,
};

export default inject18n(UserForm);
