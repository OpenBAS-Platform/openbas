import React, {PropTypes} from 'react';
import MUIMenuItem from 'material-ui/MenuItem';
import {injectIntl} from 'react-intl'

const MenuItemLinkIntl = (props) => (
  <MUIMenuItem
    primaryText={props.intl.formatMessage({id: props.label})}
    href={props.to}
    disabled={props.disabled}/>
);
export const MenuItemLink = injectIntl(MenuItemLinkIntl)

MenuItemLinkIntl.propTypes = {
  label: PropTypes.string.isRequired,
  intl: PropTypes.object,
  to: PropTypes.string,
  disabled: PropTypes.bool
}

const MenuItemButtonIntl = (props) => (
  <MUIMenuItem
    primaryText={props.intl.formatMessage({id: props.label})}
    onTouchTap={props.onClick}
    disabled={props.disabled}/>
);
export const MenuItemButton = injectIntl(MenuItemButtonIntl)

MenuItemButtonIntl.propTypes = {
  label: PropTypes.string.isRequired,
  intl: PropTypes.object,
  disabled: PropTypes.bool,
  onClick: PropTypes.func
}



