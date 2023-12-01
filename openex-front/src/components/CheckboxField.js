import React from 'react';
import { Field } from 'react-final-form';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import MuiCheckbox from '@mui/material/Checkbox';

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
      control={(
        <MuiCheckbox
          checked={input.value}
          onChange={(event) => {
            input.onChange(event.target.checked);
          }}
          {...others}
        />
      )}
      disabled={disabled}
      label={label}
      error={touched && invalid}
      helperText={touched && (error || submitError)}
    />
  </FormGroup>
);

export const CheckboxField = (props) => (
  <Field name={props.name} component={renderCheckbox} {...props} />
);
