import React, {PropTypes} from 'react';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
import * as Constants from '../constants/ComponentTypes'
import {blueGrey700} from 'material-ui/styles/colors';

const toolbarStyle = {
  [ Constants.TOOLBAR_TYPE_LOGIN ]: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: blueGrey700
  }
}

export const MyToolbar = (props) => (
  <Toolbar style={toolbarStyle[props.type]}>{props.children}</Toolbar>
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
  <ToolbarSeparator style={props.style}/>
)

MyToolbarSeparator.propTypes = {
  style: PropTypes.object,
}

const toolbarTitleStyle = {
  color: '#ffffff'
}

export const MyToolbarTitle = (props) => (
  <ToolbarTitle text={props.text} style={toolbarTitleStyle}/>
)

MyToolbarTitle.propTypes = {
  text: PropTypes.string,
  type: PropTypes.string
}