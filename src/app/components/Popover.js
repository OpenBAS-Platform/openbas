import React, {PropTypes} from 'react';
import MUIPopover from 'material-ui/Popover';

export const Popover = (props) => (
  <MUIPopover
    open={props.open}
    anchorEl={props.anchorEl}
    anchorOrigin={props.anchorOrigin}
    targetOrigin={props.targetOrigin}
    onRequestClose={props.onRequestClose}
  />
)

Popover.propTypes = {
  open: PropTypes.bool,
  anchorEl: PropTypes.object,
  anchorOrigin: PropTypes.object,
  targetOrigin: PropTypes.object,
  onRequestClose: PropTypes.func
}