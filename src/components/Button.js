import React, {PropTypes} from 'react'
import {Link} from 'react-router'
import MUIRaisedButton from 'material-ui/RaisedButton'
import MUIFloatingActionButton from 'material-ui/FloatingActionButton';
import MUIFlatButton from 'material-ui/FlatButton';
import MUIIconButton from 'material-ui/IconButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import {injectIntl} from 'react-intl'

const style = {
  margin: '5px',
}

const ButtonIntl = (props) => (
  <MUIRaisedButton secondary={true}
                   label={props.intl.formatMessage({id: props.label})}
                   type={props.type}
                   disabled={props.disabled}
                   onClick={props.onClick}
                   style={style}
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
                   style={style}/>
)
export const LinkButton = injectIntl(LinkButtonIntl)

LinkButtonIntl.propTypes = {
  to: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  intl: PropTypes.object,
  label: PropTypes.string.isRequired
}

const styleFloatingActionsButton = {
  position: 'fixed',
  bottom: 30,
  right: 30
}

export const FloatingActionsButtonCreate = (props) => (
  <MUIFloatingActionButton
    secondary={true}
    disabled={props.disabled}
    onClick={props.onClick}
    style={styleFloatingActionsButton}>
    <ContentAdd />
  </MUIFloatingActionButton>
)

FloatingActionsButtonCreate.propTypes = {
  disabled: PropTypes.bool,
  onClick: PropTypes.func
}

export const IconButton = (props) => (
  <MUIIconButton
    disabled={props.disabled}
  >
    {props.children}
  </MUIIconButton>
)

IconButton.propTypes = {
  disabled: PropTypes.bool,
  children: PropTypes.node
}