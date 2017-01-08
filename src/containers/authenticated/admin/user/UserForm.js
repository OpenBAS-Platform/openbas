import React, {Component, PropTypes} from 'react'
import {reduxForm, change} from 'redux-form'
import R from 'ramda'
import {i18nRegister} from '../../../../utils/Messages'
import {ToggleField} from '../../../../components/ToggleField'
import {FormField} from '../../../../components/Field'
import {AutoCompleteField} from '../../../../components/AutoComplete'
import AutoComplete from 'material-ui/AutoComplete'

i18nRegister({
  fr: {
    'Email address': 'Adresse email',
    'Firstname': 'Prénom',
    'Lastname': 'Nom',
    'Organization': 'Organisation',
    'Administrator': 'Administrateur',
    'Phone number': 'Numéro de téléphone',
    'PGP public key': 'Clé publique PGP'
  }
})

class UserForm extends Component {
  render() {
    let dataSource = R.map(val => val.organization_name, R.values(this.props.organizations))

    return (
      <form onSubmit={this.props.handleSubmit(this.props.onSubmit)}>
        <FormField name="user_email" fullWidth={true} type="text" label="Email address"/>
        <FormField name="user_firstname" fullWidth={true} type="text" label="Firstname"/>
        <FormField name="user_lastname" fullWidth={true} type="text" label="Lastname"/>
        <AutoCompleteField filter={AutoComplete.caseInsensitiveFilter} name="user_organization" fullWidth={true}
                           type="text" label="Organization" dataSource={dataSource}/>
        <FormField name="user_plain_password" fullWidth={true} type="password" label="Password"/>
        <ToggleField name="user_admin" label="Administrator" />
        <FormField name="user_phone" fullWidth={true} type="text" label="Phone number"/>
        <FormField name="user_pgp_key" fullWidth={true} multiLine={true} rows={5} type="text" label="PGP public key"/>
      </form>
    )
  }
}

UserForm.propTypes = {
  error: PropTypes.string,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func,
  change: PropTypes.func,
  organizations: PropTypes.object
}

export default reduxForm({form: 'UserForm'}, null, {change})(UserForm)