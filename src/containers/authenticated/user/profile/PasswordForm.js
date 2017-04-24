import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {reduxForm, change} from 'redux-form'
import {FormField} from '../../../../components/Field'

const validate = values => {
  const errors = {}
  if( !values.user_plain_password || values.user_plain_password !== values.password_confirmation ) {
    errors.user_plain_password = 'Passwords do no match'
  }

  return errors
}

class PasswordForm extends Component {
  render() {
    return (
      <form onSubmit={this.props.handleSubmit(this.props.onSubmit)}>
        <FormField name="user_plain_password" fullWidth={true} type="password" label="Password"/>
        <FormField name="password_confirmation" fullWidth={true} type="password" label="Confirmation"/>
      </form>
    )
  }
}

PasswordForm.propTypes = {
  error: PropTypes.string,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func,
  change: PropTypes.func,
}

export default reduxForm({form: 'PasswordForm', validate}, null, {change})(PasswordForm)