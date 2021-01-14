import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form } from 'react-final-form';
import { TextField } from '../../../components/TextField';
import { T } from '../../../components/I18n';

const validate = (values) => {
  const errors = {};
  if (
    !values.user_plain_password
    || values.user_plain_password !== values.password_confirmation
  ) {
    errors.user_plain_password = 'Passwords do no match';
  }

  return errors;
};

class PasswordForm extends Component {
  render() {
    const { onSubmit } = this.props;
    return (
      <Form id="passwordForm" onSubmit={onSubmit} validate={validate}>
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <TextField
              name="user_plain_password"
              fullWidth={true}
              type="password"
              label={<T>Password</T>}
            />
            <TextField
              name="password_confirmation"
              fullWidth={true}
              type="password"
              label={<T>Confirmation</T>}
              style={{ marginTop: 20 }}
            />
          </form>
        )}
      </Form>
    );
  }
}

PasswordForm.propTypes = {
  error: PropTypes.string,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func,
  change: PropTypes.func,
};

export default PasswordForm;
