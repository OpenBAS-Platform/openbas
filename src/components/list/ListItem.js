import React, {PropTypes} from 'react'
import MUIListItem from 'material-ui/List/ListItem'
import {injectIntl} from 'react-intl'
import {Link} from 'react-router'

const styles = {
  'active': {
    backgroundColor: "#BDBDBD"
  },
  'inactive': {

  }
}

const ListItemLinkIntl = (props) => (
  <MUIListItem
    primaryText={props.intl.formatMessage({id: props.label})}
    containerElement={<Link to={props.to}/>}
    style={props.active === true ? styles.active : styles.inactive}
    leftIcon={props.leftIcon}
    rightIcon={props.rightIcon}
    onTouchTap={props.onClick}
    disabled={props.disabled}/>
);
export const ListItemLink = injectIntl(ListItemLinkIntl)

ListItemLinkIntl.propTypes = {
  label: PropTypes.string,
  intl: PropTypes.object,
  to: PropTypes.string,
  leftIcon: PropTypes.element,
  rightIcon: PropTypes.element,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  active: PropTypes.bool
}

const ListItemButtonIntl = (props) => (
  <MUIListItem
    primaryText={props.intl.formatMessage({id: props.label})}
    onTouchTap={props.onClick}
    disabled={props.disabled}/>
);
export const ListItemButton = injectIntl(ListItemButtonIntl)

ListItemButtonIntl.propTypes = {
  label: PropTypes.string.isRequired,
  intl: PropTypes.object,
  disabled: PropTypes.bool,
  onClick: PropTypes.func
}

export const IconListItemLink = (props) => (
  <MUIListItem
    containerElement={<Link to={props.to}/>}
    value={props.to}
    disabled={props.disabled}
    leftIcon={props.leftIcon}
    style={props.active === true ? styles.active : styles.inactive}
    innerDivStyle={{padding: '20px 10px 20px 10px'}}/>
);

IconListItemLink.propTypes = {
  intl: PropTypes.object,
  to: PropTypes.string,
  leftIcon: PropTypes.element,
  disabled: PropTypes.bool,
  active: PropTypes.bool
}

const AvatarListItemLinkIntl = (props) => (
  <MUIListItem
    primaryText={props.intl.formatMessage({id: props.label})}
    leftAvatar={props.leftAvatar}
    rightIcon={props.rightIcon}
    onTouchTap={props.onClick}
    disabled={props.disabled}
    innerDivStyle={{padding: '20px 20px 20px 70px'}}/>
);
export const AvatarListItemLink = injectIntl(AvatarListItemLinkIntl)

AvatarListItemLinkIntl.propTypes = {
  label: PropTypes.string,
  intl: PropTypes.object,
  leftAvatar: PropTypes.element,
  rightIcon: PropTypes.element,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
}

