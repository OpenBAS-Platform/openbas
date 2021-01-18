import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Form } from 'react-final-form';
import { i18nRegister } from '../../../../utils/Messages';
import { TextField } from '../../../../components/TextField';

i18nRegister({
  fr: {
    'Email address': 'Adresse email',
    Firstname: 'Prénom',
    Lastname: 'Nom',
    Organization: 'Organisation',
    Administrator: 'Administrateur',
  },
});

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

class UserPasswordForm extends Component {
  render() {
    const { onSubmit, initialValues } = this.props;
    return (
      <Form
        initialValues={initialValues}
        onSubmit={onSubmit}
        validate={validate}
      >
        {({ handleSubmit }) => (
          <form id="passwordForm" onSubmit={handleSubmit}>
            <TextField
              name="user_plain_password"
              fullWidth={true}
              type="password"
              label="Password"
            />
            <TextField
              name="password_confirmation"
              fullWidth={true}
              type="password"
              label="Confirmation"
            />
          </form>
        )}
      </Form>
    );
  }
}

UserPasswordForm.propTypes = {
  error: PropTypes.string,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func,
  change: PropTypes.func,
};

export default UserPasswordForm;
