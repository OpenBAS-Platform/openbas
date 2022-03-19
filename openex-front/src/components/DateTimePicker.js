import React from 'react';
import TextField from '@mui/material/TextField';
import KeyboardDateTimePicker from '@mui/lab/DateTimePicker';
import { Field } from 'react-final-form';

const renderDateTimePicker = ({
  input: { onBlur, value, ...inputProps },
  meta: { submitting, error, touched },
  textFieldProps,
  ...others
}) => (
  <KeyboardDateTimePicker
    {...inputProps}
    {...others}
    ampm={false}
    format="yyyy-MM-dd HH:mm:ss"
    value={value ? new Date(value) : null}
    disabled={submitting}
    onBlur={() => onBlur(value ? new Date(value).toISOString() : null)}
    error={error && touched}
    onChange={(date) => (Date.parse(date)
      ? inputProps.onChange(date.toISOString())
      : inputProps.onChange(null))
    }
    renderInput={(props) => (
      <TextField
        {...props}
        {...textFieldProps}
        error={Boolean(touched && error)}
        helperText={touched && error}
      />
    )}
  />
);

export const DateTimePicker = (props) => (
  <Field name={props.name} component={renderDateTimePicker} {...props} />
);
