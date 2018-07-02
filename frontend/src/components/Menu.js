import React from 'react'
import PropTypes from 'prop-types'
import MUIMenu from 'material-ui/Menu';

export const Menu = (props) => (
  <MUIMenu multiple={props.multiple}>{props.children}</MUIMenu>
)

Menu.propTypes = {
  children: PropTypes.node,
  multiple: PropTypes.bool
}