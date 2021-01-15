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
    const dataSource = R.map(
      (val) => val.organization_name,
      R.values(this.props.organizations),
    );
    return (
      <form onSubmit={this.props.handleSubmit(this.props.onSubmit)}>
        <TextField
          name="user_email"
          fullWidth={true}
          type="text"
          label="Email address"
        />
        <TextField
          name="user_email2"
          fullWidth={true}
          type="text"
          label="Email address (secondary)"
        />
        <TextField
          name="user_firstname"
          fullWidth={true}
          type="text"
          label="Firstname"
        />
        <TextField
          name="user_lastname"
          fullWidth={true}
          type="text"
          label="Lastname"
        />
        <Autocomplete
          name="user_organization"
          fullWidth={true}
          type="text"
          label="Organization"
          dataSource={dataSource}
        />
        <TextField
          name="user_phone2"
          fullWidth={true}
          type="text"
          label="Phone number (fix)"
        />
        <TextField
          name="user_phone"
          fullWidth={true}
          type="text"
          label="Phone number (mobile)"
        />
        <TextField
          name="user_phone3"
          fullWidth={true}
          type="text"
          label="Phone number (secondary)"
        />
        <TextField
          name="user_pgp_key"
          fullWidth={true}
          multiLine={true}
          rows={5}
          type="text"
          label="PGP public key"
        />
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

export default UserForm;
