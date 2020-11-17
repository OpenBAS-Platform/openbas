import React from 'react';
import PropTypes from 'prop-types';
import MUIList from 'material-ui/List';

export const List = (props) => (
  <MUIList style={props.style}>{props.children}</MUIList>
);

List.propTypes = {
  style: PropTypes.object,
  children: PropTypes.node,
};
