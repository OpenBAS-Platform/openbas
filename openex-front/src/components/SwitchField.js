import React from 'react';
import { Field } from 'react-final-form';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import MuiSwitch from '@mui/material/Switch';

const renderSwitch = ({
  label,
  input,
  meta: {
    touched, invalid, error, submitError,
  },
  style,
  ...others
}) => (
  <FormGroup row={true} style={{ ...style, marginLeft: 5 }}>
    <FormControlLabel
      control={
        <MuiSwitch
          checked={input.value}
          onChange={(event) => {
            input.onChange(event.target.checked);
          }}
          {...others}
        />
      }
      label={label}
      error={touched && invalid}
      helperText={touched && (error || submitError)}
    />
  </FormGroup>
);

export const SwitchField = (props) => (
  <Field name={props.name} component={renderSwitch} {...props} />
);
