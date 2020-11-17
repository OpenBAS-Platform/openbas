import React from 'react';
import PropTypes from 'prop-types';
import MUIToggle from 'material-ui/Toggle';
import { Field } from 'redux-form';

const renderToggleField = ({ input, label }) => (
  <MUIToggle
    label={label}
    toggled={input.value}
    {...input}
    onToggle={(event, value) => {
      input.onChange(value);
    }}
  />
);

renderToggleField.propTypes = {
  input: PropTypes.object,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onToggle: PropTypes.func,
};

export const ToggleField = (props) => (
  <Field label={props.label} component={renderToggleField} {...props} />
);

ToggleField.propTypes = {
  name: PropTypes.string,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};
