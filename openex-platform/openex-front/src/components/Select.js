import React from 'react';
import MUISelect from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import { Field } from 'react-final-form';

const renderFromHelper = ({ touched, error, submitError }) => {
  if (!(touched && error)) {
    return '';
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
  ...others
}) => (
  <FormControl error={touched && error} fullWidth={fullWidth} style={style}>
    <InputLabel htmlFor={name}>{label}</InputLabel>
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
    {renderFromHelper({ touched, error, submitError })}
  </FormControl>
);

// eslint-disable-next-line import/prefer-default-export
export const Select = (props) => (
  <Field name={props.name} component={renderSelectField} {...props} />
);
