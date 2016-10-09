import React, {PropTypes} from 'react'
import {Link} from 'react-router'
import MUIMenuItem from 'material-ui/MenuItem'
import {injectIntl} from 'react-intl'

const MenuItemLinkIntl = (props) => (
  <MUIMenuItem
    primaryText={props.intl.formatMessage({id: props.label})}
    containerElement={<Link to={props.to}/>}
    disabled={props.disabled}
    key={props.key}
    value={props.value}
    onTouchTap={props.onTouchTap}/>
);
export const MenuItemLink = injectIntl(MenuItemLinkIntl)

MenuItemLinkIntl.propTypes = {
  label: PropTypes.string.isRequired,
  intl: PropTypes.object,
  to: PropTypes.string,
  disabled: PropTypes.bool,
  key: PropTypes.string,
  value: PropTypes.string,
  onTouchTap: PropTypes.func
}

const MenuItemButtonIntl = (props) => (
  <MUIMenuItem
    primaryText={props.intl.formatMessage({id: props.label})}
    onTouchTap={props.onTouchTap}
    disabled={props.disabled}
  />
);
export const MenuItemButton = injectIntl(MenuItemButtonIntl)

MenuItemButtonIntl.propTypes = {
  label: PropTypes.string.isRequired,
  intl: PropTypes.object,
  disabled: PropTypes.bool,
  onTouchTap: PropTypes.func
}