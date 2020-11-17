import React from 'react';
import PropTypes from 'prop-types';
import MUIPopover from 'material-ui/Popover';

export const Popover = (props) => (
  <MUIPopover
    open={props.open}
    anchorEl={props.anchorEl}
    anchorOrigin={props.anchorOrigin}
    targetOrigin={props.targetOrigin}
    onRequestClose={props.onRequestClose}
  >
    {props.children}
  </MUIPopover>
);

Popover.propTypes = {
  open: PropTypes.bool,
  anchorEl: PropTypes.object,
  anchorOrigin: PropTypes.object,
  targetOrigin: PropTypes.object,
  onRequestClose: PropTypes.func,
  children: PropTypes.node,
};
