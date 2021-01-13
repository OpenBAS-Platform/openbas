import React from 'react';
import PropTypes from 'prop-types';
import { reduxForm } from 'redux-form';
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
    error, onSubmit, handleSubmit, pristine, submitting,
  } = props;
  return (
    <div style={{ padding: 15 }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          name="username"
          type="text"
          label="Email address"
          fullWidth={true}
        />
        <TextField
          name="password"
          type="password"
          label="Password"
          fullWidth={true}
          style={{ marginTop: 20 }}
          error={!!error}
          helperText={error ? <T>Authentication failed</T> : ''}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={pristine || submitting}
          onClick={handleSubmit(onSubmit)}
          style={{ marginTop: 20 }}
        >
          <T>Sign in</T>
        </Button>
      </form>
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

export default reduxForm({
  form: 'LoginForm',
  validate,
})(LoginForm);
