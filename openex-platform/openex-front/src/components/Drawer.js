import React from 'react';
import * as PropTypes from 'prop-types';
import MUIDrawer from '@material-ui/core/Drawer';

// eslint-disable-next-line import/prefer-default-export
export const Drawer = (props) => (
  <MUIDrawer
    width={props.width}
    docked={props.docked}
    open={props.open}
    openSecondary={props.openSecondary}
    style={{ zIndex: 2000 - props.zindex }}
    onRequestChange={props.onRequestChange}
  >
    {props.children}
  </MUIDrawer>
);

Drawer.propTypes = {
  width: PropTypes.number,
  docked: PropTypes.bool,
  open: PropTypes.bool,
  openSecondary: PropTypes.bool,
  onRequestChange: PropTypes.func,
  children: PropTypes.node,
  zindex: PropTypes.number,
};
