import React from 'react';
import { useIntl } from 'react-intl';
import TextField from '@mui/material/TextField';
import { DateTimePicker as MuiDateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { Field } from 'react-final-form';

const dateFormatsMap = {
  'en-us': 'yyyy-MM-dd',
  'fr-fr': 'dd/MM/yyyy',
  'es-es': 'dd/MM/yyyy',
  'zg-cn': 'yyyy-MM-dd',
};

const DateTimePickerBase = ({
  input: { onBlur, value, ...inputProps },
  meta: { submitting, error, touched },
  textFieldProps,
  ...others
}) => {
  const intl = useIntl();
  return (
    <MuiDateTimePicker
      {...inputProps}
      {...others}
      ampm={false}
      format="yyyy-MM-dd HH:mm:ss"
      value={value ? new Date(value) : null}
      disabled={submitting}
      onBlur={() => onBlur(value ? new Date(value).toISOString() : null)}
      inputFormat={dateFormatsMap[intl.locale] || 'yyyy-MM-dd'}
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
};

export const DateTimePicker = (props) => (
  <Field name={props.name} component={DateTimePickerBase} {...props} />
);
