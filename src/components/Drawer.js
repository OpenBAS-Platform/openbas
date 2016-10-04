import React, {PropTypes} from 'react';
import MUIDrawer from 'material-ui/Drawer';
import {zIndex} from 'material-ui/styles';

export const Drawer = (props) => (
  <MUIDrawer
    width={props.width}
    docked={props.docked}
    open={props.open}
    style={{zIndex: zIndex.drawer - props.zindex}}
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
  zindex: PropTypes.number
}