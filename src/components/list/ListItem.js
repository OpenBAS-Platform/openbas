import React, {PropTypes} from 'react'
import MUIListItem from 'material-ui/List/ListItem'
import {injectIntl} from 'react-intl'
import {Link} from 'react-router'
import * as Constants from '../../constants/ComponentTypes'

const styles = {
  'active': {
    backgroundColor: '#BDBDBD',
  },
  'inactive': {
  },
  'mainitem': {
    borderBottom: '1px solid #E0E0E0'
  },
  'mainitemdisabled': {
    borderBottom: '1px solid #E0E0E0',
    backgroundColor: '#F0F0F0'
  },
  'mainsmallitem': {
    borderBottom: '1px solid #E0E0E0'
  },
  'mainsmallitemdisabled': {
    borderBottom: '1px solid #E0E0E0',
    backgroundColor: '#F0F0F0'
  },
  'secondaryitem': {
    marginLeft: '30px',
    borderBottom: '1px solid #E0E0E0'
  },
  'secondaryitemdisabled': {
    marginLeft: '30px',
    borderBottom: '1px solid #E0E0E0',
    backgroundColor: '#F0F0F0'
  },
}

const innerDivStyle = {
  [ Constants.LIST_ITEM_NOSPACE ]: {
    padding: '16px 16px 16px 55px'
  }
}

const ListItemLinkIntl = (props) => (
  <MUIListItem
    primaryText={props.intl.formatMessage({id: props.label})}
    containerElement={<Link to={props.to}/>}
    style={props.active === true ? styles.active : styles.inactive}
    innerDivStyle={innerDivStyle[props.type]}
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
  active: PropTypes.bool,
  type: PropTypes.string
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

export const MainListItem = (props) => (
  <MUIListItem
    primaryText={props.primaryText}
    secondaryText={props.secondaryText}
    leftAvatar={props.leftAvatar}
    rightIcon={props.rightIcon}
    onTouchTap={props.onClick}
    disabled={props.disabled}
    nestedItems={props.nestedItems}
    initiallyOpen={true}
    style={props.disabled ? styles.mainitemdisabled : styles.mainitem}
    rightIconButton={props.rightIconButton}/>
);

MainListItem.propTypes = {
  primaryText: PropTypes.node,
  secondaryText: PropTypes.node,
  leftAvatar: PropTypes.element,
  rightIcon: PropTypes.element,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  rightIconButton: PropTypes.node,
  nestedItems: PropTypes.arrayOf(PropTypes.node)
}

export const SecondaryListItem = (props) => (
  <MUIListItem
    primaryText={props.primaryText}
    secondaryText={props.secondaryText}
    leftAvatar={props.leftAvatar}
    rightIcon={props.rightIcon}
    onTouchTap={props.onClick}
    disabled={props.disabled}
    nestedItems={props.nestedItems}
    initiallyOpen={true}
    style={props.disabled ? styles.secondaryitemdisabled : styles.secondaryitem}
    rightIconButton={props.rightIconButton}/>
);

SecondaryListItem.propTypes = {
  primaryText: PropTypes.node,
  secondaryText: PropTypes.node,
  leftAvatar: PropTypes.element,
  rightIcon: PropTypes.element,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  rightIconButton: PropTypes.node,
  nestedItems: PropTypes.arrayOf(PropTypes.node)
}

export const MainSmallListItem = (props) => (
  <MUIListItem
    primaryText={props.primaryText}
    secondaryText={props.secondaryText}
    leftAvatar={props.leftAvatar}
    rightIcon={props.rightIcon}
    onTouchTap={props.onClick}
    disabled={props.disabled}
    style={props.disabled ? styles.mainsmallitemdisabled : styles.mainsmallitem}
    rightIconButton={props.rightIconButton}/>
);

MainSmallListItem.propTypes = {
  primaryText: PropTypes.node,
  secondaryText: PropTypes.node,
  leftAvatar: PropTypes.element,
  rightIcon: PropTypes.element,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  rightIconButton: PropTypes.node
}
