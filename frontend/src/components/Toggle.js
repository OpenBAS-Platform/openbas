import React from 'react'
import PropTypes from 'prop-types'
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