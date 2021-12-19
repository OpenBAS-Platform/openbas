import React from 'react';
import { Field } from 'react-final-form';
import MuiTextField from '@material-ui/core/TextField';

const renderTextField = ({
  label,
  input,
  meta: {
    touched, invalid, error, submitError,
  },
  ...others
}) => (
  <MuiTextField
    label={label}
    error={touched && invalid}
    helperText={touched && (error || submitError)}
    {...input}
    {...others}
  />
);

// eslint-disable-next-line import/prefer-default-export
export const TextField = (props) => (
  <Field name={props.name} component={renderTextField} {...props} />
);
