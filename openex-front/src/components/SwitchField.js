import React from 'react';
import { Field } from 'react-final-form';
import { FormGroup, FormControlLabel, Switch as MuiSwitch } from '@mui/material';

const renderSwitch = ({
  label,
  input,
  meta: { touched, invalid, error, submitError },
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

const SwitchField = (props) => (
  <Field name={props.name} component={renderSwitch} {...props} />
);

export default SwitchField;
