import React, {PropTypes} from 'react';
import MUIAppBar from 'material-ui/AppBar';
import * as Constants from '../constants/ComponentTypes'

const appBarTitleStyle = {
  [ Constants.APPBAR_TYPE_TOPBAR ]: {
    marginLeft: 20,
    cursor: 'pointer'
  }
}

export const AppBar = (props) => (
  <MUIAppBar
    title={props.title}
    onTitleTouchTap={props.onTitleTouchTap}
    onLeftIconButtonTouchTap={props.onLeftIconButtonTouchTap}
    iconElementRight={props.iconElementRight}
    showMenuIconButton={props.showMenuIconButton}
    titleStyle={appBarTitleStyle[props.type]}
  />
)

AppBar.propTypes = {
  title: PropTypes.string,
  type: PropTypes.string,
  onTitleTouchTap: PropTypes.func,
  onLeftIconButtonTouchTap: PropTypes.func,
  iconElementRight: PropTypes.element,
  showMenuIconButton: PropTypes.bool
}