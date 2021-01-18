import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Form } from 'react-final-form';
import * as R from 'ramda';
import { i18nRegister } from '../../../../utils/Messages';
import { T } from '../../../../components/I18n';
import { Switch } from '../../../../components/Switch';
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
              options={dataSource}
              style={{ marginTop: 20 }}
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
              name="user_pgp_key"
              fullWidth={true}
              multiline={true}
              rows={5}
              label={<T>PGP public key</T>}
              style={{ marginTop: 20 }}
            />
            {!this.props.editing && (
              <TextField
                name="user_plain_password"
                fullWidth={true}
                type="password"
                label={<T>Password</T>}
                style={{ marginTop: 20 }}
              />
            )}
            <Switch
              name="user_admin"
              label={<T>Administrator</T>}
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
  editing: PropTypes.boolean,
};

export default UserForm;
