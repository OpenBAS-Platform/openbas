import React from 'react';
import * as PropTypes from 'prop-types';
import MUIMenu from '@material-ui/core/Menu';

// eslint-disable-next-line import/prefer-default-export
export const Menu = (props) => (
  <MUIMenu multiple={props.multiple}>{props.children}</MUIMenu>
);

Menu.propTypes = {
  children: PropTypes.node,
  multiple: PropTypes.bool,
};
