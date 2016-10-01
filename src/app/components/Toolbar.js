import React, {PropTypes} from 'react';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';

export const MyToolbar = (props) => (
  <Toolbar>{props.children}</Toolbar>
)

MyToolbar.propTypes = {
  children: PropTypes.node,
}

export const MyToolbarGroup = (props) => (
  <ToolbarGroup>{props.children}</ToolbarGroup>
)

MyToolbarGroup.propTypes = {
  children: PropTypes.node,
}

export const MyToolbarSeparator = (props) => (
  <ToolbarSeparator style={props.style} />
)

MyToolbarSeparator.propTypes = {
  style: PropTypes.object,
}

export const MyToolbarTitle = (props) => (
  <ToolbarTitle text={props.text} />
)

MyToolbarTitle.propTypes = {
  text: PropTypes.string,
}