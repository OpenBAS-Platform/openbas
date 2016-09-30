import React, {PropTypes} from 'react';
import MUIPopover from 'material-ui/Popover';

export const Popover = (props) => (
  <MUIPopover open={props.open} anchorEl={props.anchorEl} onRequestClose={props.onRequestClose}>
    {props.children}
  </MUIPopover>
)

Popover.propTypes = {
  open: PropTypes.bool,
  anchorEl: PropTypes.object,
  onRequestClose: PropTypes.func,
  children: PropTypes.node
}