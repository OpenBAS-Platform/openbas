import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Form } from 'react-final-form';
import * as R from 'ramda';
import { i18nRegister } from '../../../../utils/Messages';
import { T } from '../../../../components/I18n';
import { ToggleField } from '../../../../components/ToggleField';
import { TextField } from '../../../../components/TextField';
import { Autocomplete } from '../../../../components/Autocomplete';

i18nRegister({
  fr: {
    'Email address': 'Adresse email',
    'Email address (secondary)': 'Adresse email (secondaire)',
    Firstname: 'Prénom',
    Lastname: 'Nom',
    Organization: 'Organisation',
    Administrator: 'Administrateur',
    Planner: 'Planificateur',
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
    const { onSubmit, initialValues } = this.props;
    return (
      <Form
        initialValues={initialValues}
        onSubmit={onSubmit}
      >
        {({ handleSubmit }) => (
          <form id="userForm" onSubmit={handleSubmit}>
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
              multiline={true}
              rows={5}
              type="text"
              label="PGP public key"
            />
            {this.props.editing ? (
              ''
            ) : (
              <TextField
                name="user_plain_password"
                fullWidth={true}
                type="password"
                label="Password"
              />
            )}
            <ToggleField name="user_admin" label={<T>Administrator</T>} />
            <br />
            <ToggleField name="user_planificateur" label={<T>Planner</T>} />
            <br />
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
  editing: PropTypes.boolean,
};

export default UserForm;
