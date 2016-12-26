import React, {PropTypes} from 'react'
import {Link} from 'react-router'
import MenuItem from 'material-ui/MenuItem'
import {injectIntl} from 'react-intl'

const MenuItemLinkIntl = (props) => (
  <MenuItem
    primaryText={props.intl.formatMessage({id: props.label})}
    containerElement={<Link to={props.to}/>}
    disabled={props.disabled}
    value={props.value}
    onTouchTap={props.onTouchTap}/>
)
export const MenuItemLink = injectIntl(MenuItemLinkIntl)

MenuItemLinkIntl.propTypes = {
  label: PropTypes.oneOfType([PropTypes.string.isRequired, PropTypes.object.isRequired]),
  to: PropTypes.string,
  disabled: PropTypes.bool,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onTouchTap: PropTypes.func,
  intl: PropTypes.object
}

const MenuItemButtonIntl = (props) => (
  <MenuItem
    primaryText={props.intl.formatMessage({id: props.label})}
    onTouchTap={props.onTouchTap}
    disabled={props.disabled}
  />
)
export const MenuItemButton = injectIntl(MenuItemButtonIntl)

MenuItemButtonIntl.propTypes = {
  label: PropTypes.string.isRequired,
  intl: PropTypes.object,
  disabled: PropTypes.bool,
  onTouchTap: PropTypes.func
}
