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
  <FormGroup row={true} style={style}>
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

// eslint-disable-next-line import/prefer-default-export
export const Switch = (props) => (
  <Field name={props.name} component={renderSwitch} {...props} />
);
