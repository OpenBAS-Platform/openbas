import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import MUIRaisedButton from 'material-ui/RaisedButton';
import MUIFloatingActionButton from 'material-ui/FloatingActionButton';
import MUIFlatButton from 'material-ui/FlatButton';
import MUIIconButton from 'material-ui/IconButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import AVPlayArrow from 'material-ui/svg-icons/av/play-arrow';
import { injectIntl } from 'react-intl';
import * as Constants from '../constants/ComponentTypes';

const styles = {
  RaisedButton: {
    margin: '5px',
  },
};

const buttonStyle = {
  [Constants.BUTTON_TYPE_FLOATING]: {
    position: 'fixed',
    bottom: 30,
    right: 30,
    zIndex: '1000',
  },
  [Constants.BUTTON_TYPE_FLOATING_PADDING]: {
    position: 'fixed',
    bottom: 30,
    right: 330,
    zIndex: '1000',
  },
  [Constants.BUTTON_TYPE_DIALOG_LEFT]: {
    float: 'left',
    marginTop: '-35px',
  },
  [Constants.BUTTON_TYPE_CREATE_RIGHT]: {
    marginTop: '4px',
  },
  [Constants.BUTTON_TYPE_SINGLE]: {
    float: 'left',
    margin: '-5px 0px 0px 0px',
  },
  [Constants.BUTTON_TYPE_MAINLIST2]: {
    margin: '10px 0px 0px 0px',
  },
};

const ButtonIntl = (props) => (
  <MUIRaisedButton
    secondary={true}
    label={props.intl.formatMessage({ id: props.label })}
    type={props.type}
    disabled={props.disabled}
    onClick={props.onClick}
    style={styles.RaisedButton}
    containerElement={props.containerElement}
  />
);
export const Button = injectIntl(ButtonIntl);

ButtonIntl.propTypes = {
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  intl: PropTypes.object,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  containerElement: PropTypes.node,
};

const FlatButtonIntl = (props) => (
  <MUIFlatButton
    secondary={props.secondary}
    primary={props.primary}
    label={props.intl.formatMessage({ id: props.label })}
    style={buttonStyle[props.type]}
    disabled={props.disabled}
    onClick={props.onClick}
  />
);
export const FlatButton = injectIntl(FlatButtonIntl);

FlatButtonIntl.propTypes = {
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  intl: PropTypes.object,
  disabled: PropTypes.bool,
  primary: PropTypes.bool,
  secondary: PropTypes.bool,
  onClick: PropTypes.func,
};

export const LinkFlatButtonIntl = (props) => (
  <MUIFlatButton
    secondary={props.secondary}
    primary={props.primary}
    containerElement={<Link to={props.to} />}
    label={props.intl.formatMessage({ id: props.label })}
    style={buttonStyle[props.type]}
    disabled={props.disabled}
  />
);
export const LinkFlatButton = injectIntl(LinkFlatButtonIntl);

LinkFlatButtonIntl.propTypes = {
  to: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  intl: PropTypes.object,
  disabled: PropTypes.bool,
  primary: PropTypes.bool,
  secondary: PropTypes.bool,
};

export const LinkButtonIntl = (props) => (
  <MUIRaisedButton
    primary={true}
    containerElement={<Link to={props.to} />}
    disabled={props.disabled}
    label={props.intl.formatMessage({ id: props.label })}
    style={styles.RaisedButton}
  />
);
export const LinkButton = injectIntl(LinkButtonIntl);

LinkButtonIntl.propTypes = {
  to: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  intl: PropTypes.object,
  label: PropTypes.string.isRequired,
};

export const FloatingActionsButtonCreate = (props) => (
  <MUIFloatingActionButton
    secondary={true}
    disabled={props.disabled}
    onClick={props.onClick}
    style={buttonStyle[props.type]}
  >
    <ContentAdd />
  </MUIFloatingActionButton>
);

FloatingActionsButtonCreate.propTypes = {
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  children: PropTypes.node,
  type: PropTypes.string,
};

export const FloatingActionsButtonPlay = (props) => (
  <MUIFloatingActionButton
    secondary={true}
    disabled={props.disabled}
    onClick={props.onClick}
    style={buttonStyle[props.type]}
  >
    <AVPlayArrow />
  </MUIFloatingActionButton>
);

FloatingActionsButtonPlay.propTypes = {
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  children: PropTypes.node,
  type: PropTypes.string,
};

export const ActionButtonCreate = (props) => (
  <MUIFloatingActionButton
    mini={true}
    disabled={props.disabled}
    onClick={props.onClick}
    backgroundColor="#9FA8DA"
    zDepth={0}
    style={buttonStyle[props.type]}
  >
    <ContentAdd />
  </MUIFloatingActionButton>
);

ActionButtonCreate.propTypes = {
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  children: PropTypes.node,
  type: PropTypes.string,
};

export const IconButton = (props) => (
  <MUIIconButton
    disabled={props.disabled}
    tooltipPosition={props.tooltipPosition}
    tooltip={props.tooltip}
    onClick={props.onClick}
    style={buttonStyle[props.type]}
  >
    {props.children}
  </MUIIconButton>
);

IconButton.propTypes = {
  disabled: PropTypes.bool,
  children: PropTypes.node,
  onClick: PropTypes.func,
  type: PropTypes.string,
  tooltip: PropTypes.string,
  tooltipPosition: PropTypes.string,
};

const LinkIconButtonIntl = (props) => (
  <MUIIconButton
    tooltipPosition={props.tooltipPosition}
    tooltip={
      props.tooltip
        ? props.intl.formatMessage({ id: props.tooltip })
        : undefined
    }
    disabled={props.disabled}
    containerElement={<Link to={props.to} target={props.target} />}
    style={buttonStyle[props.type]}
  >
    {props.children}
  </MUIIconButton>
);

export const LinkIconButton = injectIntl(LinkIconButtonIntl);

LinkIconButtonIntl.propTypes = {
  disabled: PropTypes.bool,
  tooltip: PropTypes.string,
  tooltipPosition: PropTypes.string,
  children: PropTypes.node,
  to: PropTypes.string,
  type: PropTypes.string,
  intl: PropTypes.object,
  target: PropTypes.string,
};
