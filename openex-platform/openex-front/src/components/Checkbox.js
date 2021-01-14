import React from 'react';
import MUICheckbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { Field } from 'react-final-form';

const renderCheckbox = ({ input, label, style }) => (
  <div>
    <FormControlLabel
      control={
        <MUICheckbox
          checked={!!input.value}
          onChange={input.onChange}
        />
      }
      label={label}
      style={style}
    />
  </div>
);

// eslint-disable-next-line import/prefer-default-export
export const Checkbox = (props) => (
  <Field name={props.name} component={renderCheckbox} {...props} />
);
