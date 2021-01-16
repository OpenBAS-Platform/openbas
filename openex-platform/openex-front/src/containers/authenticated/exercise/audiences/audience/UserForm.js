import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Form } from 'react-final-form';
import * as R from 'ramda';
import { TextField } from '../../../../../components/TextField';
import { Autocomplete } from '../../../../../components/Autocomplete';
import { i18nRegister } from '../../../../../utils/Messages';

i18nRegister({
  fr: {
    'Email address': 'Adresse email',
    'Email address (secondary)': 'Adresse email (secondaire)',
    Firstname: 'Prénom',
    Lastname: 'Nom',
    Organization: 'Organisation',
    'Phone number (fix)': 'Numéro de téléphone (fixe)',
    'Phone number (mobile)': 'Numéro de téléphone (mobile)',
    'Phone number (secondary)': 'Numéro de téléphone (secondaire)',
    'PGP public key': 'Clé publique PGP',
  },
});

class UserForm extends Component {
  render() {
    const options = R.map(
      (val) => val.organization_name,
      R.values(this.props.organizations),
    );
    const { onSubmit, initialValues } = this.props;
    return (
      <Form initialValues={initialValues} onSubmit={onSubmit}>
        {({ handleSubmit }) => (
          <form id="userForm" onSubmit={handleSubmit}>
            <TextField
              name="user_email"
              fullWidth={true}
              label="Email address"
            />
            <TextField
              name="user_email2"
              fullWidth={true}
              label="Email address (secondary)"
              style={{ marginTop: 20 }}
            />
            <TextField
              name="user_firstname"
              fullWidth={true}
              label="Firstname"
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
            <TextField
              name="user_phone2"
              fullWidth={true}
              label="Phone number (fix)"
              style={{ marginTop: 20 }}
            />
            <TextField
              name="user_phone"
              fullWidth={true}
              label="Phone number (mobile)"
              style={{ marginTop: 20 }}
            />
            <TextField
              name="user_phone3"
              fullWidth={true}
              label="Phone number (secondary)"
              style={{ marginTop: 20 }}
            />
            <TextField
              name="user_pgp_key"
              fullWidth={true}
              multiLine={true}
              rows={5}
              label="PGP public key"
              style={{ marginTop: 20 }}
            />
          </form>
        )}
      </Form>
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

export default UserForm;
