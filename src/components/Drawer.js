import React, {PropTypes} from 'react';
import MUIDrawer from 'material-ui/Drawer';
import {zIndex} from 'material-ui/styles';

export const Drawer = (props) => (
  <MUIDrawer
    width={props.width}
    docked={props.docked}
    open={props.open}
    openSecondary={props.openSecondary}
    style={{zIndex: zIndex.drawer - props.zindex}}
    onRequestChange={props.onRequestChange}>
    {props.children}
  </MUIDrawer>
)

Drawer.propTypes = {
  width: PropTypes.number,
  docked: PropTypes.bool,
  open: PropTypes.bool,
  openSecondary: PropTypes.bool,
  onRequestChange: PropTypes.func,
  children: PropTypes.node,
  zindex: PropTypes.number
}