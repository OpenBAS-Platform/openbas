import React from 'react';
import { Field } from 'react-final-form';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import MuiSwitch from '@material-ui/core/Switch';

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
          toggled={input.value}
          onChange={(event) => {
            input.onChange(event.target.value);
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
