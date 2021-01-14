import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'react-final-form';
import Button from '@material-ui/core/Button';
import { i18nRegister } from '../../../utils/Messages';
import { T } from '../../../components/I18n';
import { TextField } from '../../../components/TextField';

i18nRegister({
  fr: {
    'Email address': 'Adresse email',
    Password: 'Mot de passe',
    'Sign in': 'Se connecter',
    'Authentication failed': "Echec de l'authentification",
  },
});

const validate = (values) => {
  const errors = {};
  const requiredFields = ['username', 'password'];
  requiredFields.forEach((field) => {
    if (!values[field]) {
      errors[field] = 'Required';
    }
  });
  return errors;
};

const LoginForm = (props) => {
  const {
    error, onSubmit, pristine, submitting,
  } = props;
  return (
    <div style={{ padding: 15 }}>
      <Form onSubmit={onSubmit} validate={validate}>
        {({ handleSubmit, submitError, touched }) => (
          <form onSubmit={handleSubmit}>
            <TextField
              name="username"
              type="text"
              label="Email address"
              fullWidth={true}
              style={{ marginTop: 5 }}
            />
            <TextField
              name="password"
              type="password"
              label="Password"
              fullWidth={true}
              style={{ marginTop: 20 }}
              error={error || submitError}
              helperText={
                (error || submitError) && touched && (error || submitError)
              }
            />
            <Button
              type="submit"
              variant="contained"
              disabled={pristine || submitting}
              onClick={handleSubmit}
              style={{ marginTop: 20 }}
            >
              <T>Sign in</T>
            </Button>
          </form>
        )}
      </Form>
    </div>
  );
};

LoginForm.propTypes = {
  error: PropTypes.string,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func,
};

export default LoginForm;
