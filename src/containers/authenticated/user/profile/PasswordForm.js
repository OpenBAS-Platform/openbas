import React, {Component, PropTypes} from 'react'
import {reduxForm, change} from 'redux-form'
import {FormField} from '../../../../components/Field'

class PasswordForm extends Component {
  render() {
    return (
      <form onSubmit={this.props.handleSubmit(this.props.onSubmit)}>
        {this.props.error && <div><strong>{this.props.error}</strong><br/></div>}
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

export default reduxForm({form: 'ExerciseForm'}, null, {change})(PasswordForm)