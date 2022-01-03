import React from 'react';
import MUISelect from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/material/FormHelperText';
import { Field } from 'react-final-form';

const renderFromHelper = ({
  touched, error, submitError, helperText,
}) => {
  if (!(touched && error)) {
    return helperText;
  }
  return <FormHelperText>{touched && (error || submitError)}</FormHelperText>;
};

const renderSelectField = ({
  name,
  input: { onChange, ...inputProps },
  label,
  meta: { touched, error, submitError },
  children,
  fullWidth,
  style,
  onChange: onChangePassed,
  helperText,
  ...others
}) => (
  <FormControl error={touched && error} fullWidth={fullWidth} style={style}>
    <InputLabel htmlFor={name} variant={others.variant || 'standard'}>
      {label}
    </InputLabel>
    <MUISelect
      onChange={(event) => {
        onChange(event.target.value);
        if (typeof onChangePassed === 'function') {
          onChangePassed(event);
        }
      }}
      {...inputProps}
      {...others}
      inputProps={{
        name,
        id: name,
      }}
    >
      {children}
    </MUISelect>
    {renderFromHelper({
      touched,
      error,
      submitError,
      helperText,
    })}
  </FormControl>
);

// eslint-disable-next-line import/prefer-default-export
export const Select = (props) => (
  <Field name={props.name} component={renderSelectField} {...props} />
);
