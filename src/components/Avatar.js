import React, {PropTypes} from 'react';
import * as Constants from '../constants/ComponentTypes'
import MUIAvatar from 'material-ui/Avatar';

const avatarStyle = {
  [ Constants.AVATAR_TYPE_TOPBAR ]: {
    marginRight: '10px',
    marginTop: '5px',
    cursor: 'pointer'
  },
  [ Constants.AVATAR_TYPE_LIST ]: {
    position: 'absolute',
    top: '8px',
    left: '16px'
  },
  [ Constants.AVATAR_TYPE_MAINLIST ]: {
    position: 'absolute',
    top: '14px',
    left: '16px'
  },
  [ Constants.AVATAR_TYPE_CHIP ]: {
    float: 'left',
    margin: '0 5px 0 -12px'
  }
}

export const Avatar = (props) => (
  <MUIAvatar
    src={props.src}
    size={props.size}
    onTouchTap={props.onTouchTap}
    style={avatarStyle[props.type]}
  />
)

Avatar.propTypes = {
  src: PropTypes.string,
  onTouchTap: PropTypes.func,
  size: PropTypes.number,
  type: PropTypes.string
}