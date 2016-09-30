import React, {PropTypes} from 'react';
import * as Constants from '../constants/ComponentTypes'
import LocalMovies from 'material-ui/svg-icons/maps/local-movies'
import HardwareComputer from 'material-ui/svg-icons/hardware/computer'

const iconStyle = {
  [ Constants.ICON_TYPE_NAVBAR ]: {
    margin: 0,
    padding: 0,
    left: 19,
    top: 8
  }
}

export const Icon = (props) => {
  const mergeStyle = Object.assign( {}, props.style, iconStyle[props.type])
  switch (props.name) {
    case Constants.ICON_NAME_LOCAL_MOVIES:
      return (<LocalMovies style={mergeStyle} color={props.color} />)
    case Constants.ICON_NAME_HARDWARE_COMPUTER:
      return (<HardwareComputer style={mergeStyle} color={props.color} />)
    default:
      return (<HardwareComputer style={mergeStyle} color={props.color} />)
  }
}

Icon.propTypes = {
  name: PropTypes.string,
  type: PropTypes.string,
  style: PropTypes.object,
  color: PropTypes.string
}