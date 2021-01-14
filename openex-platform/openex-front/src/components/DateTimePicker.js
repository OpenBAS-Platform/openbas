import React from 'react';
import { KeyboardDateTimePicker } from '@material-ui/pickers';
import { Field } from 'react-final-form';

const renderDateTimePicker = ({
  input: { onBlur, value, ...inputProps },
  meta: { submitting, error, touched },
  ...others
}) => (
  <KeyboardDateTimePicker
    {...inputProps}
    {...others}
    format="yyyy-MM-dd HH:mm:ss"
    value={value ? new Date(value) : null}
    disabled={submitting}
    onBlur={() => onBlur(value ? new Date(value).toISOString() : null)}
    error={error && touched}
    onChange={(date) => (Date.parse(date)
      ? inputProps.onChange(date.toISOString())
      : inputProps.onChange(null))
    }
  />
);

// eslint-disable-next-line import/prefer-default-export
export const DateTimePicker = (props) => (
  <Field name={props.name} component={renderDateTimePicker} {...props} />
);
