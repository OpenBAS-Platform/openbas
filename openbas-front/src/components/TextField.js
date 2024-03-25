import React from 'react';
import { Field } from 'react-final-form';
import { TextField as MuiTextField } from '@mui/material';
import { useFormatter } from './i18n';

const TextFieldBase = ({
  label,
  input,
  meta: { touched, invalid, error, submitError },
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

/**
 * @deprecated The component use old form libnary react-final-form
 */
const TextField = (props) => (
  <Field name={props.name} component={TextFieldBase} {...props} />
);

export default TextField;
