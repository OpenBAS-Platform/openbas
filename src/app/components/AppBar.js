import React, {PropTypes} from 'react';
import MUIAppBar from 'material-ui/AppBar';
import * as Constants from '../constants/ComponentTypes'

const appBarStyle = {
  [ Constants.APPBAR_TYPE_TOPBAR ]: {
    title: {
      marginLeft: 20,
      cursor: 'pointer'
    }
  }
}

export const AppBar = (props) => (
  <MUIAppBar
    title={props.title}
    onTitleTouchTap={props.onTitleTouchTap}
    onLeftIconButtonTouchTap={props.onLeftIconButtonTouchTap}
    iconElementRight={props.iconElementRight}
    showMenuIconButton={props.showMenuIconButton}
    style={appBarStyle[props.type]['appbar']}
    titleStyle={appBarStyle[props.type]['title']}
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