import React, {PropTypes} from 'react';
import {
  Toolbar as MUIToolbar,
  ToolbarGroup as MUIToolbarGroup,
  ToolbarSeparator as MUIToolbarSeparator,
  ToolbarTitle as MUIToolbarTitle
} from 'material-ui/Toolbar';
import * as Constants from '../constants/ComponentTypes'
import {blueGrey700} from 'material-ui/styles/colors';

const toolbarStyle = {
  [ Constants.TOOLBAR_TYPE_LOGIN ]: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: blueGrey700
  }
}

export const Toolbar = (props) => (
  <MUIToolbar style={toolbarStyle[props.type]} {...props}>{props.children}</MUIToolbar>
)

Toolbar.propTypes = {
  children: PropTypes.node,
  type: PropTypes.string
}

export const ToolbarGroup = (props) => (
  <MUIToolbarGroup>{props.children}</MUIToolbarGroup>
)

ToolbarGroup.propTypes = {
  children: PropTypes.node,
}

export const ToolbarSeparator = (props) => (
  <MUIToolbarSeparator style={props.style}/>
)

ToolbarSeparator.propTypes = {
  style: PropTypes.object,
}

const toolbarTitleStyle = {
  color: '#ffffff'
}

export const ToolbarTitle = (props) => (
  <MUIToolbarTitle text={props.text} style={toolbarTitleStyle}/>
)

ToolbarTitle.propTypes = {
  text: PropTypes.string,
  type: PropTypes.string
}