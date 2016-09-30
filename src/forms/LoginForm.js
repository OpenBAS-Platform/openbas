import React, {PropTypes} from 'react'
import {reduxForm} from 'redux-form'
import {FormField} from '../components/Field'
import {Button} from '../components/Button'

const validate = values => {
  const errors = {}
  const requiredFields = ['username', 'password']
  requiredFields.forEach(field => {
    if (!values[field]) {
      errors[field] = 'Required'
    }
  })
  return errors
}

const LoginForm = (props) => {
  const {error, onSubmit, handleSubmit, pristine, submitting} = props
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {error && <div><strong>{error}</strong><br/></div>}
      <FormField name="username" type="text" label="Username" hint="Your name"/>
      <br/>
      <FormField name="password" type="password" label="Password" hint="Your password"/>
      <br/>
      <Button type="submit" disabled={pristine || submitting} label="Login"/>
    </form>
  )
}

LoginForm.propTypes = {
  error: PropTypes.string,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func
}

export default reduxForm({
  form: 'LoginForm',  // a unique identifier for this form
  validate
})(LoginForm)