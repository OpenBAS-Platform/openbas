import React, {PropTypes} from 'react'
import {Link} from 'react-router'
import * as Constants from '../constants/ComponentTypes'
import MUIRaisedButton from 'material-ui/RaisedButton'
import MUIFloatingActionButton from 'material-ui/FloatingActionButton';
import MUIFlatButton from 'material-ui/FlatButton';
import MUIIconButton from 'material-ui/IconButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import {injectIntl} from 'react-intl'

const styles = {
  'RaisedButton': {
    margin: '5px',
  }
}

const buttonStyle = {
  [ Constants.BUTTON_TYPE_STICKLEFT ]: {
    marginLeft: '-5px'
  }
}

const ButtonIntl = (props) => (
  <MUIRaisedButton secondary={true}
                   label={props.intl.formatMessage({id: props.label})}
                   type={props.type}
                   disabled={props.disabled}
                   onClick={props.onClick}
                   style={styles.RaisedButton}
                   containerElement={props.containerElement}/>
)
export const Button = injectIntl(ButtonIntl)

ButtonIntl.propTypes = {
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  intl: PropTypes.object,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  containerElement: PropTypes.node
}

const FlatButtonIntl = (props) => (
  <MUIFlatButton secondary={true}
                 label={props.intl.formatMessage({id: props.label})}
                 type={props.type}
                 disabled={props.disabled}
                 onClick={props.onClick}
                 onTouchTap={props.onTouchTap}
  />
)
export const FlatButton = injectIntl(FlatButtonIntl)

FlatButtonIntl.propTypes = {
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  intl: PropTypes.object,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  onTouchTap: PropTypes.func
}

export const LinkButtonIntl = (props) => (
  <MUIRaisedButton primary={true}
                   containerElement={<Link to={props.to}/>}
                   disabled={props.disabled}
                   label={props.intl.formatMessage({id: props.label})}
                   style={styles.RaisedButton}/>
)
export const LinkButton = injectIntl(LinkButtonIntl)

LinkButtonIntl.propTypes = {
  to: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  intl: PropTypes.object,
  label: PropTypes.string.isRequired
}

const styleFloatingActionsButtonCreate = {
  position: 'fixed',
  bottom: 30,
  right: 30
}

export const FloatingActionsButtonCreate = (props) => (
  <MUIFloatingActionButton
    secondary={true}
    disabled={props.disabled}
    onClick={props.onClick}
    style={styleFloatingActionsButtonCreate}>
    <ContentAdd />
  </MUIFloatingActionButton>
)

FloatingActionsButtonCreate.propTypes = {
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  children: PropTypes.node
}

const styleActionButtonCreate = {
  position: 'fixed',
  top: 12,
  right: 15
}

export const ActionButtonCreate = (props) => (
  <MUIFloatingActionButton
    mini={true}
    disabled={props.disabled}
    onClick={props.onClick}
    backgroundColor="#9FA8DA"
    zDepth={0}
    style={styleActionButtonCreate}>
    <ContentAdd />
  </MUIFloatingActionButton>
)

ActionButtonCreate.propTypes = {
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  children: PropTypes.node
}

export const IconButton = (props) => (
  <MUIIconButton
    disabled={props.disabled}
    onClick={props.onClick}
    style={buttonStyle[props.type]}
  >
    {props.children}
  </MUIIconButton>
)

IconButton.propTypes = {
  disabled: PropTypes.bool,
  children: PropTypes.node,
  onClick: PropTypes.func,
  type: PropTypes.string
}