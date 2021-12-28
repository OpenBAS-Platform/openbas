import React from 'react';
import { Field } from 'react-final-form';
import TextField from '@mui/material/TextField';
import MuiAutocomplete from '@mui/material/Autocomplete';

const renderAutocomplete = ({
  label,
  input: { onChange, ...inputProps },
  meta: { touched, invalid, error },
  fullWidth,
  style,
  ...others
}) => (
  <MuiAutocomplete
    label={label}
    onInputChange={(event, value) => {
      if (others.freeSolo) {
        onChange(value);
      }
    }}
    onChange={(event, value) => {
      onChange(value);
    }}
    {...inputProps}
    {...others}
    renderInput={(params) => (
      <TextField
        {...params}
        variant={others.variant || 'standard'}
        label={label}
        fullWidth={fullWidth}
        style={style}
        error={touched && invalid}
        helperText={touched && error}
      />
    )}
  />
);

// eslint-disable-next-line import/prefer-default-export
export const Autocomplete = (props) => (
  <Field name={props.name} component={renderAutocomplete} {...props} />
);
