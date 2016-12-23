import React, {Component, PropTypes} from 'react'
import {reduxForm, change} from 'redux-form'
import {FormField} from '../../../../components/Field'

class UserinfoForm extends Component {
  render() {
    return (
      <form onSubmit={this.props.handleSubmit(this.props.onSubmit)}>
        <FormField name="user_phone" fullWidth={true} type="text" label="Phone number"/>
        <FormField name="user_pgp_key" fullWidth={true} multiLine={true} rows={5} type="text" label="PGP public key"/>
      </form>
    )
  }
}

UserinfoForm.propTypes = {
  error: PropTypes.string,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func,
  change: PropTypes.func,
}

export default reduxForm({form: 'UserinfoForm'}, null, {change})(UserinfoForm)