import React, {Component, PropTypes} from 'react'
import {reduxForm, change} from 'redux-form'
import {FormField} from '../../../../components/Field'
import {i18nRegister} from '../../../../utils/Messages'

i18nRegister({
  fr: {
    'Phone number (fix)': 'Numéro de téléphone (fixe)',
    'Phone number (mobile)': 'Numéro de téléphone (mobile)',
    'Phone number (secondary)': 'Numéro de téléphone (secondaire)',
    'PHP public key': 'Clé publique PGP'
  }
})

class ProfileForm extends Component {
  render() {
    return (
      <form onSubmit={this.props.handleSubmit(this.props.onSubmit)}>
        {this.props.error && <div><strong>{this.props.error}</strong><br/></div>}
        <FormField name="user_phone2" fullWidth={true} type="text" label="Phone number (fix)"/>
        <FormField name="user_phone" fullWidth={true} type="text" label="Phone number (mobile)"/>
        <FormField name="user_phone3" fullWidth={true} type="text" label="Phone number (secondary)"/>
        <FormField name="user_pgp_key" fullWidth={true} multiLine={true} rows={5} type="text" label="PGP public key"/>
      </form>
    )
  }
}

ProfileForm.propTypes = {
  error: PropTypes.string,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func,
  change: PropTypes.func,
}

export default reduxForm({form: 'ProfileForm'}, null, {change})(ProfileForm)