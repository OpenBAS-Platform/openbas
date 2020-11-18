import React from 'react';
import PropTypes from 'prop-types';
import MUISwitch from '@material-ui/core/Switch';

export const Toggle = (props) => (
  <MUISwitch
    label={props.label}
    onToggle={props.onToggle}
    defaultToggled={props.defaultToggled}
    toggled={props.toggled}
  />
);

Toggle.propTypes = {
  label: PropTypes.node,
  defaultToggled: PropTypes.bool,
  toggled: PropTypes.bool,
  onToggle: PropTypes.func,
};
