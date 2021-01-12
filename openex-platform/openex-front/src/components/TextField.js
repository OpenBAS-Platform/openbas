import React from 'react';
import { Field } from 'redux-form';
import MuiTextField from '@material-ui/core/TextField';

const renderTextField = ({
  label,
  input,
  meta: { touched, invalid, error },
  ...custom
}) => (
  <MuiTextField
    label={label}
    placeholder={label}
    error={touched && invalid}
    helperText={touched && error}
    {...input}
    {...custom}
  />
);

// eslint-disable-next-line import/prefer-default-export
export const TextField = (props) => (
  <Field name={props.name} component={renderTextField} label={props.label} {...props} />
);
