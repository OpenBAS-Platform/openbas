import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Form } from 'react-final-form';
import * as R from 'ramda';
import { T } from '../../../../../components/I18n';
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
              label={<T>Lastname</T>}
              style={{ marginTop: 20 }}
            />
            <Autocomplete
              name="user_organization"
              fullWidth={true}
              label={<T>Organization</T>}
              options={options}
              style={{ marginTop: 20 }}
              freeSolo={true}
            />
            <TextField
              name="user_phone2"
              fullWidth={true}
              label={<T>Phone number (fix)</T>}
              style={{ marginTop: 20 }}
            />
            <TextField
              name="user_phone"
              fullWidth={true}
              label={<T>Phone number (mobile)</T>}
              style={{ marginTop: 20 }}
            />
            <TextField
              name="user_phone3"
              fullWidth={true}
              label={<T>Phone number (secondary)</T>}
              style={{ marginTop: 20 }}
            />
            <TextField
              name="user_latitude"
              fullWidth={true}
              label={<T>Latitude</T>}
              style={{ marginTop: 20 }}
            />
            <TextField
              name="user_longitude"
              fullWidth={true}
              label={<T>Longitude</T>}
              style={{ marginTop: 20 }}
            />
            <TextField
              name="user_pgp_key"
              fullWidth={true}
              multiline={true}
              rows={5}
              label={<T>PGP public key</T>}
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
