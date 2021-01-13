import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, change } from 'redux-form';
import * as R from 'ramda';
import MenuItem from '@material-ui/core/MenuItem';
import { T } from '../../../components/I18n';
import { Select } from '../../../components/Select';
import { TextField } from '../../../components/TextField';
import { i18nRegister } from '../../../utils/Messages';
import { Autocomplete } from '../../../components/Autocomplete';

i18nRegister({
  fr: {
    'Email address': 'Adresse email',
    'Email address (secondary)': 'Adresse email (secondaire)',
    Firstname: 'Prénom',
    Lastname: 'Nom',
    Organization: 'Organisation',
    Language: 'Langue',
    Automatic: 'Automatique',
  },
});

class UserForm extends Component {
  render() {
    const options = R.map(
      (val) => val.organization_name,
      R.values(this.props.organizations),
    );
    return (
      <form onSubmit={this.props.handleSubmit(this.props.onSubmit)}>
        <TextField
          name="user_email"
          fullWidth={true}
          label={<T>Email address</T>}
        />
        <TextField
          name="user_email2"
          fullWidth={true}
          label={<T>Email address (secondary)</T>}
          style={{ marginTop: 20 }}
        />
        <TextField
          name="user_firstname"
          fullWidth={true}
          label={<T>Firstname</T>}
          style={{ marginTop: 20 }}
        />
        <TextField
          name="user_lastname"
          fullWidth={true}
          label="Lastname"
          style={{ marginTop: 20 }}
        />
        <Autocomplete
          name="user_organization"
          fullWidth={true}
          label="Organization"
          options={options}
          style={{ marginTop: 20 }}
        />
        <Select
          label={<T>Language</T>}
          name="user_lang"
          fullWidth={true}
          style={{ marginTop: 20 }}
        >
          <MenuItem key="auto" value="auto">
            <T>Automatic</T>
          </MenuItem>
          <MenuItem key="en" value="en">
            English
          </MenuItem>
          <MenuItem key="fr" value="fr">
            Français
          </MenuItem>
        </Select>
      </form>
    );
  }
}

UserForm.propTypes = {
  error: PropTypes.string,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func,
  change: PropTypes.func,
  organizations: PropTypes.object,
};

export default reduxForm({ form: 'UserForm' }, null, { change })(UserForm);
