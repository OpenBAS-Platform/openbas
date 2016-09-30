import React, {PropTypes} from 'react';
import MUIDrawer from 'material-ui/Drawer';

export const Drawer = (props) => (
  <MUIDrawer
    width={props.width}
    docked={props.docked}
    open={props.open}
    style={props.style}
    onRequestChange={props.onRequestChange}>
    {props.children}
  </MUIDrawer>
)

Drawer.propTypes = {
  width: PropTypes.number,
  docked: PropTypes.bool,
  open: PropTypes.bool,
  onRequestChange: PropTypes.func,
  children: PropTypes.node,
  style: PropTypes.object
}