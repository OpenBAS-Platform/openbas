import React, {PropTypes} from 'react';
import MUIDrawer from 'material-ui/Drawer';

export const Drawer = (props) => (
  <MUIDrawer
    width={props.width}
    docked={props.docked}
    open={props.open}
    style={props.style}
  />
)

Drawer.propTypes = {
  width: PropTypes.number,
  docked: PropTypes.bool,
  open: PropTypes.bool,
  style: PropTypes.object
}