import React from 'react';
import { Field } from 'redux-form';
import MuiTextField from '@material-ui/core/TextField';

const renderTextField = ({
  label,
  input,
  meta: { touched, invalid, error },
  ...others
}) => (
    <MuiTextField
      label={label}
      error={touched && invalid}
      helperText={touched && error}
      {...input}
      {...others}
    />
);

// eslint-disable-next-line import/prefer-default-export
export const TextField = (props) => (
  <Field name={props.name} component={renderTextField} {...props} />
);
