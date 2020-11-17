import React from 'react';
import PropTypes from 'prop-types';
import MUIAppBar from 'material-ui/AppBar';
import * as Constants from '../constants/ComponentTypes';

const appBarStyle = {
  [Constants.APPBAR_TYPE_TOPBAR]: {
    position: 'fixed',
  },
  [Constants.APPBAR_TYPE_TOPBAR_NOICON]: {
    marginBottom: '20px',
    position: 'fixed',
  },
};

const appBarTitleStyle = {
  [Constants.APPBAR_TYPE_TOPBAR]: {
    textAlign: 'left',
    marginLeft: '60px',
    cursor: 'pointer',
  },
  [Constants.APPBAR_TYPE_TOPBAR_NOICON]: {
    textAlign: 'left',
    marginLeft: '10px',
    cursor: 'pointer',
  },
  [Constants.APPBAR_TYPE_LEFTBAR]: {
    cursor: 'pointer',
  },
};

export const AppBar = (props) => (
  <MUIAppBar
    title={props.title}
    onTitleClick={props.onTitleTouchTap}
    onLeftIconButtonClick={props.onLeftIconButtonTouchTap}
    iconElementRight={props.iconElementRight}
    iconElementLeft={props.iconElementLeft}
    showMenuIconButton={props.showMenuIconButton}
    titleStyle={appBarTitleStyle[props.type]}
    style={appBarStyle[props.type]}
  />
);

AppBar.propTypes = {
  title: PropTypes.node,
  type: PropTypes.string,
  onTitleTouchTap: PropTypes.func,
  onLeftIconButtonTouchTap: PropTypes.func,
  iconElementRight: PropTypes.element,
  iconElementLeft: PropTypes.element,
  showMenuIconButton: PropTypes.bool,
};
