import React, {PropTypes} from 'react';
import MUIToggle from 'material-ui/Toggle';

export const Toggle = (props) => (
  <MUIToggle
    label={props.label}
    onToggle={props.onToggle}
    defaultToggled={props.defaultToggled}
  />
)

Toggle.propTypes = {
  label: PropTypes.node,
  defaultToggled: PropTypes.bool,
  onToggle: PropTypes.func,
}