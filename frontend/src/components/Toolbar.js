import React from 'react'
import PropTypes from 'prop-types'
import {
  Toolbar as MUIToolbar,
  ToolbarGroup as MUIToolbarGroup,
  ToolbarSeparator as MUIToolbarSeparator,
  ToolbarTitle as MUIToolbarTitle
} from 'material-ui/Toolbar'
import Theme from './Theme'
import * as Constants from '../constants/ComponentTypes'

const toolbarStyle = {
  [ Constants.TOOLBAR_TYPE_LOGIN ]: {
    borderTopLeftRadius: '10px',
    borderTopRightRadius: '10px',
    backgroundColor: Theme.palette.primary1Color
  },
  [ Constants.TOOLBAR_TYPE_EVENT ]: {
    position: 'fixed',
    top: 0,
    right: 320,
    zIndex: '5000',
    backgroundColor: 'none',
  },
  [ Constants.TOOLBAR_TYPE_AUDIENCE ]: {
    position: 'fixed',
    top: 0,
    right: 320,
    zIndex: '5000',
    backgroundColor: 'none',
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
  <MUIToolbarGroup firstChild={props.firstChild} lastChild={props.lastChild}>{props.children}</MUIToolbarGroup>
)

ToolbarGroup.propTypes = {
  children: PropTypes.node,
  firstChild: PropTypes.bool,
  lastChild: PropTypes.bool
}

export const ToolbarSeparator = (props) => (
  <MUIToolbarSeparator style={props.style}/>
)

ToolbarSeparator.propTypes = {
  style: PropTypes.object,
}

const toolbarTitleStyle = {
  [ Constants.TOOLBAR_TYPE_LOGIN ]: {
    color: '#ffffff'
  },
  [ Constants.TOOLBAR_TYPE_EVENT]: {
    color: '#ffffff',
    position: 'absolute',
    right: 20,
    top: '3px',
    fontSize: '24px',
    fontWeight: '400'
  }
}

export const ToolbarTitle = (props) => (
  <MUIToolbarTitle text={props.text} style={toolbarTitleStyle[props.type]}/>
)

ToolbarTitle.propTypes = {
  text: PropTypes.node,
  type: PropTypes.string
}