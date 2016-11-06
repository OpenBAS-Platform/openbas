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
  }
}

export const Avatar = (props) => (
  <MUIAvatar
    src={props.src}
    onTouchTap={props.onTouchTap}
    style={avatarStyle[props.type]}
  />
)

Avatar.propTypes = {
  src: PropTypes.string,
  onTouchTap: PropTypes.func,
  type: PropTypes.string
}