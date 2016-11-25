import React, {Component, PropTypes} from 'react'
import {Link} from 'react-router'
import MenuItem from 'material-ui/MenuItem'
import {injectIntl} from 'react-intl'

class MenuItemLinkClass extends Component {
    render() {
        return (<MenuItem
            primaryText={this.props.label}
            containerElement={<Link to={this.props.to}/>}
            disabled={this.props.disabled}
            value={this.props.value}
            onTouchTap={this.props.onTouchTap}/>)
    }
}

export const MenuItemLink = MenuItemLinkClass

MenuItemLink.propTypes = {
  label: PropTypes.oneOfType([PropTypes.string.isRequired, PropTypes.object.isRequired]),
  to: PropTypes.string,
  disabled: PropTypes.bool,
  value: PropTypes.string,
  onTouchTap: PropTypes.func
}

const MenuItemButtonIntl = (props) => (
  <MenuItem
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
