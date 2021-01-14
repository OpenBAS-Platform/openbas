import React from 'react';
import { Field } from 'react-final-form';
import TextField from '@material-ui/core/TextField';
import MuiAutocomplete from '@material-ui/lab/Autocomplete';

const renderAutocomplete = ({
  label,
  input,
  meta: { touched, invalid, error },
  fullWidth,
  style,
  ...others
}) => (
  <MuiAutocomplete
    label={label}
    error={touched && invalid}
    helperText={touched && error}
    onChange={input.onChange}
    {...input}
    {...others}
    renderInput={(params) => (
      <TextField
        {...params}
        label={label}
        fullWidth={fullWidth}
        style={style}
      />
    )}
  />
);

// eslint-disable-next-line import/prefer-default-export
export const Autocomplete = (props) => (
  <Field name={props.name} component={renderAutocomplete} {...props} />
);
