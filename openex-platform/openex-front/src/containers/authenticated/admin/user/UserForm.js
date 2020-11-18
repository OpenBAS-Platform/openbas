import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, change } from 'redux-form';
import * as R from 'ramda';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { i18nRegister } from '../../../../utils/Messages';
import { T } from '../../../../components/I18n';
import { ToggleField } from '../../../../components/ToggleField';
import { FormField } from '../../../../components/Field';
import { AutoCompleteField } from '../../../../components/AutoComplete';

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

    return (
      <form onSubmit={this.props.handleSubmit(this.props.onSubmit)}>
        <FormField
          name="user_email"
          fullWidth={true}
          type="text"
          label="Email address"
        />
        <FormField
          name="user_email2"
          fullWidth={true}
          type="text"
          label="Email address (secondary)"
        />
        <FormField
          name="user_firstname"
          fullWidth={true}
          type="text"
          label="Firstname"
        />
        <FormField
          name="user_lastname"
          fullWidth={true}
          type="text"
          label="Lastname"
        />
        <AutoCompleteField
          filter={Autocomplete.caseInsensitiveFilter}
          name="user_organization"
          fullWidth={true}
          type="text"
          label="Organization"
          dataSource={dataSource}
        />
        <FormField
          name="user_phone2"
          fullWidth={true}
          type="text"
          label="Phone number (fix)"
        />
        <FormField
          name="user_phone"
          fullWidth={true}
          type="text"
          label="Phone number (mobile)"
        />
        <FormField
          name="user_phone3"
          fullWidth={true}
          type="text"
          label="Phone number (secondary)"
        />
        <FormField
          name="user_pgp_key"
          fullWidth={true}
          multiLine={true}
          rows={5}
          type="text"
          label="PGP public key"
        />
        {this.props.editing ? (
          ''
        ) : (
          <FormField
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

export default reduxForm({ form: 'UserForm' }, null, { change })(UserForm);
