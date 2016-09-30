import React, {PropTypes} from 'react';
import {Link} from 'react-router';
import OriginalDrawer from 'material-ui/Drawer';

export const Drawer = (props) => (
  <OriginalDrawer width={props.width}
          docked={props.docked}
          open={props.open}
          style={{zIndex: zIndex.drawer - 100}}
  />
)

Drawer.propTypes = {
  width: PropTypes.number,
  docked: PropTypes.bool,
  open: PropTypes.bool,
  style: PropTypes.func
}

export const LinkButton = (props) => (
  <RaisedButton primary={true}
                containerElement={<Link to={props.to}/>}
                disabled={props.disabled}
                label={props.label}
                style={style}/>
)

LinkButton.propTypes = {
  to: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  label: PropTypes.string.isRequired
}