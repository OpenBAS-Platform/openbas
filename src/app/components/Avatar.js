import React, {PropTypes} from 'react';
import MUIAvatar from 'material-ui/Avatar';

export const Avatar = (props) => (
  <MUIAvatar
    src={props.src}
    onTouchTap={props.onTouchTap}
  />
)

Avatar.propTypes = {
  src: PropTypes.string,
  onTouchTap: PropTypes.func,
}