import React, {PropTypes} from 'react';
import MUIToggle from 'material-ui/Toggle';

export const Toggle = (props) => (
  <MUIToggle
    label={props.label}
    onToggle={props.onToggle}
    defaultToggled={props.defaultToggled}
    toggled={props.toggled}
  />
)

Toggle.propTypes = {
  label: PropTypes.node,
  defaultToggled: PropTypes.bool,
  toggled: PropTypes.bool,
  onToggle: PropTypes.func,
}