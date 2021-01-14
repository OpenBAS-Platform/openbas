import React from 'react';
import MUISelect from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import { Field } from 'react-final-form';

const renderFromHelper = ({ touched, error }) => {
  if (!(touched && error)) {
    return '';
  }
  return <FormHelperText>{touched && error}</FormHelperText>;
};

const renderSelectField = ({
  name,
  input,
  label,
  meta: { touched, error },
  children,
  fullWidth,
  style,
  ...others
}) => (
  <FormControl error={touched && error} fullWidth={fullWidth} style={style}>
    <InputLabel htmlFor={name}>{label}</InputLabel>
    <MUISelect
      {...input}
      {...others}
      inputProps={{
        name,
        id: name,
      }}
    >
      {children}
    </MUISelect>
    {renderFromHelper({ touched, error })}
  </FormControl>
);

// eslint-disable-next-line import/prefer-default-export
export const Select = (props) => (
  <Field name={props.name} component={renderSelectField} {...props} />
);
