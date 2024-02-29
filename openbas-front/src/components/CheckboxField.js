import React from 'react';
import { Field } from 'react-final-form';
import { FormGroup, FormControlLabel, Checkbox as MuiCheckbox } from '@mui/material';

const renderCheckbox = ({
  label,
  input,
  meta: { touched, invalid, error, submitError },
  style,
  disabled,
  ...others
}) => (
  <FormGroup row={true} style={{ ...style, marginLeft: 5 }}>
    <FormControlLabel
      control={
        <MuiCheckbox
          checked={input.value}
          onChange={(event) => {
            input.onChange(event.target.checked);
          }}
          {...others}
        />
      }
      disabled={disabled}
      label={label}
      error={touched && invalid}
      helperText={touched && (error || submitError)}
    />
  </FormGroup>
);

const CheckboxField = (props) => (
  <Field name={props.name} component={renderCheckbox} {...props} />
);

export default CheckboxField;
