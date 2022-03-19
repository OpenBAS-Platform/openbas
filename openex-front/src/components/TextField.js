import React from 'react';
import { Field } from 'react-final-form';
import MuiTextField from '@mui/material/TextField';
import { useFormatter } from './i18n';

const renderTextField = ({
  label,
  input,
  meta: {
    touched, invalid, error, submitError,
  },
  ...others
}) => {
  const { t } = useFormatter();
  return (
    <MuiTextField
      label={label}
      error={touched && invalid}
      helperText={
        touched && ((error && t(error)) || (submitError && t(submitError)))
      }
      {...input}
      {...others}
    />
  );
};

export const TextField = (props) => (
  <Field name={props.name} component={renderTextField} {...props} />
);
