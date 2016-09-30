import React, {PropTypes} from 'react';
import MUIAvatar from 'material-ui/Avatar';

export const Avatar = (props) => (
  <MUIAvatar
    src={props.src}
    style={props.style}
    onTouchTap={props.onTouchTap}
  />
)

Avatar.propTypes = {
  src: PropTypes.string,
  style: PropTypes.object,
  onTouchTap: PropTypes.func,
}