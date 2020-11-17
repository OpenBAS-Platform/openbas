import React from 'react';
import PropTypes from 'prop-types';
import MUIListItem from 'material-ui/List/ListItem';
import { injectIntl } from 'react-intl';
import { Link } from 'react-router';
import Theme from '../Theme';
import * as Constants from '../../constants/ComponentTypes';

const styles = {
  headeritem: {
    height: '50px',
  },
  active: {
    backgroundColor: '#BDBDBD',
  },
  inactive: {},
  mainitem: {
    borderBottom: '1px solid #E0E0E0',
  },
  mainitemdisabled: {
    borderBottom: '1px solid #E0E0E0',
    backgroundColor: '#F0F0F0',
  },
  secondaryitem: {
    marginLeft: '30px',
    borderBottom: '1px solid #E0E0E0',
  },
  secondaryitemdisabled: {
    marginLeft: '30px',
    borderBottom: '1px solid #E0E0E0',
    backgroundColor: '#F0F0F0',
  },
  tertiaryitem: {
    marginLeft: '60px',
    borderBottom: '1px solid #E0E0E0',
  },
  tertiaryitemdisabled: {
    marginLeft: '60px',
    borderBottom: '1px solid #E0E0E0',
    backgroundColor: '#F0F0F0',
  },
  mainsmallitem: {
    borderBottom: '1px solid #E0E0E0',
  },
  mainsmallitemdisabled: {
    borderBottom: '1px solid #E0E0E0',
    backgroundColor: '#F0F0F0',
  },
  secondarysmallitem: {
    marginLeft: '15px',
    borderBottom: '1px solid #E0E0E0',
  },
  secondarysmallitemdisabled: {
    marginLeft: '15px',
    borderBottom: '1px solid #E0E0E0',
    backgroundColor: '#F0F0F0',
  },
};

const innerDivStyle = {
  [Constants.LIST_ITEM_NOSPACE]: {
    padding: '16px 16px 16px 55px',
  },
};

const innerDivStyleGrey = {
  [Constants.LIST_ITEM_NOSPACE]: {
    padding: '16px 16px 16px 55px',
    color: Theme.palette.disabledColor,
  },
};

const ListItemLinkIntl = (props) => (
  <MUIListItem
    primaryText={props.intl.formatMessage({ id: props.label })}
    containerElement={<Link to={props.to} />}
    style={props.active ? styles.active : styles.inactive}
    innerDivStyle={
      props.grey ? innerDivStyleGrey[props.type] : innerDivStyle[props.type]
    }
    leftIcon={props.leftIcon}
    rightIcon={props.rightIcon}
    onClick={props.onClick}
    disabled={props.disabled}
  />
);
export const ListItemLink = injectIntl(ListItemLinkIntl);

ListItemLinkIntl.propTypes = {
  label: PropTypes.string,
  intl: PropTypes.object,
  to: PropTypes.string,
  leftIcon: PropTypes.element,
  rightIcon: PropTypes.element,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  active: PropTypes.bool,
  type: PropTypes.string,
  grey: PropTypes.bool,
};

export const IconListItemLink = (props) => (
  <MUIListItem
    containerElement={<Link to={props.to} />}
    value={props.to}
    disabled={props.disabled}
    leftIcon={props.leftIcon}
    style={props.active === true ? styles.active : styles.inactive}
    innerDivStyle={{ padding: '20px 10px 20px 10px' }}
  />
);

IconListItemLink.propTypes = {
  intl: PropTypes.object,
  to: PropTypes.string,
  leftIcon: PropTypes.element,
  disabled: PropTypes.bool,
  active: PropTypes.bool,
};

export const AvatarListItem = (props) => (
  <MUIListItem
    primaryText={props.primaryText}
    secondaryText={props.secondaryText}
    leftAvatar={props.leftAvatar}
    leftIcon={props.leftIcon}
    rightIcon={props.rightIcon}
    onClick={props.onClick}
    disabled={props.disabled}
    nestedItems={props.nestedItems}
    initiallyOpen={true}
    style={props.disabled ? styles.mainitemdisabled : styles.mainitem}
    rightIconButton={props.rightIconButton}
  />
);

AvatarListItem.propTypes = {
  primaryText: PropTypes.node,
  secondaryText: PropTypes.node,
  leftAvatar: PropTypes.element,
  leftIcon: PropTypes.element,
  rightIcon: PropTypes.element,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  rightIconButton: PropTypes.node,
  nestedItems: PropTypes.arrayOf(PropTypes.node),
};

export const AvatarHeaderItem = (props) => (
  <MUIListItem
    primaryText={props.primaryText}
    secondaryText={props.secondaryText}
    leftAvatar={props.leftAvatar}
    rightIcon={props.rightIcon}
    onClick={props.onClick}
    disabled={props.disabled}
    nestedItems={props.nestedItems}
    initiallyOpen={true}
    style={styles.headeritem}
    hoverColor="#ffffff"
    disableKeyboardFocus={true}
    rightIconButton={props.rightIconButton}
  />
);

AvatarHeaderItem.propTypes = {
  primaryText: PropTypes.node,
  secondaryText: PropTypes.node,
  leftAvatar: PropTypes.element,
  rightIcon: PropTypes.element,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  rightIconButton: PropTypes.element,
  nestedItems: PropTypes.arrayOf(PropTypes.node),
};

export const MainListItem = (props) => (
  <MUIListItem
    primaryText={props.primaryText}
    secondaryText={props.secondaryText}
    secondaryTextLines={props.secondaryTextLines}
    leftAvatar={props.leftAvatar}
    leftIcon={props.leftIcon}
    rightIcon={props.rightIcon}
    onClick={props.onClick}
    disabled={props.disabled}
    nestedItems={props.nestedItems}
    initiallyOpen={props.initiallyOpen}
    style={props.disabled ? styles.mainitemdisabled : styles.mainitem}
    innerDivStyle={{ padding: '20px 10px 20px 60px' }}
    rightIconButton={props.rightIconButton}
  />
);

MainListItem.propTypes = {
  primaryText: PropTypes.node,
  secondaryText: PropTypes.node,
  secondaryTextLines: PropTypes.number,
  leftAvatar: PropTypes.element,
  leftIcon: PropTypes.element,
  rightIcon: PropTypes.element,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  initiallyOpen: PropTypes.bool,
  rightIconButton: PropTypes.node,
  nestedItems: PropTypes.arrayOf(PropTypes.node),
};

export const MainListItemLink = (props) => (
  <MUIListItem
    containerElement={<Link to={props.to} />}
    primaryText={props.primaryText}
    secondaryText={props.secondaryText}
    leftAvatar={props.leftAvatar}
    leftIcon={props.leftIcon}
    rightIcon={props.rightIcon}
    onClick={props.onClick}
    disabled={props.disabled}
    nestedItems={props.nestedItems}
    initiallyOpen={props.initiallyOpen}
    style={props.disabled ? styles.mainitemdisabled : styles.mainitem}
    innerDivStyle={{ padding: '20px 10px 20px 60px' }}
    rightIconButton={props.rightIconButton}
  />
);

MainListItemLink.propTypes = {
  to: PropTypes.string,
  primaryText: PropTypes.node,
  secondaryText: PropTypes.node,
  leftAvatar: PropTypes.element,
  leftIcon: PropTypes.element,
  rightIcon: PropTypes.element,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  initiallyOpen: PropTypes.bool,
  rightIconButton: PropTypes.node,
  nestedItems: PropTypes.arrayOf(PropTypes.node),
};

export const SecondaryListItem = (props) => (
  <MUIListItem
    primaryText={props.primaryText}
    secondaryText={props.secondaryText}
    leftAvatar={props.leftAvatar}
    leftIcon={props.leftIcon}
    rightIcon={props.rightIcon}
    onClick={props.onClick}
    disabled={props.disabled}
    nestedItems={props.nestedItems}
    initiallyOpen={props.initiallyOpen}
    style={props.disabled ? styles.secondaryitemdisabled : styles.secondaryitem}
    innerDivStyle={{ padding: '20px 10px 20px 60px' }}
    rightIconButton={props.rightIconButton}
  />
);

SecondaryListItem.propTypes = {
  primaryText: PropTypes.node,
  secondaryText: PropTypes.node,
  leftAvatar: PropTypes.element,
  leftIcon: PropTypes.element,
  rightIcon: PropTypes.element,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  initiallyOpen: PropTypes.bool,
  rightIconButton: PropTypes.node,
  nestedItems: PropTypes.arrayOf(PropTypes.node),
};

export const TertiaryListItem = (props) => (
  <MUIListItem
    primaryText={props.primaryText}
    secondaryText={props.secondaryText}
    leftAvatar={props.leftAvatar}
    leftIcon={props.leftIcon}
    rightIcon={props.rightIcon}
    onClick={props.onClick}
    disabled={props.disabled}
    nestedItems={props.nestedItems}
    initiallyOpen={false}
    style={props.disabled ? styles.tertiaryitemdisabled : styles.tertiaryitem}
    innerDivStyle={{ padding: '20px 20px 20px 60px' }}
    rightIconButton={props.rightIconButton}
  />
);

TertiaryListItem.propTypes = {
  primaryText: PropTypes.node,
  secondaryText: PropTypes.node,
  leftAvatar: PropTypes.element,
  leftIcon: PropTypes.element,
  rightIcon: PropTypes.element,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  rightIconButton: PropTypes.node,
  nestedItems: PropTypes.arrayOf(PropTypes.node),
};

export const SecondarySmallListItem = (props) => (
  <MUIListItem
    primaryText={props.primaryText}
    secondaryText={props.secondaryText}
    leftAvatar={props.leftAvatar}
    leftIcon={props.leftIcon}
    rightIcon={props.rightIcon}
    onClick={props.onClick}
    disabled={props.disabled}
    style={
      props.disabled
        ? styles.secondarysmallitemdisabled
        : styles.secondarysmallitem
    }
    rightIconButton={props.rightIconButton}
  />
);

SecondarySmallListItem.propTypes = {
  primaryText: PropTypes.node,
  secondaryText: PropTypes.node,
  leftAvatar: PropTypes.element,
  leftIcon: PropTypes.element,
  rightIcon: PropTypes.element,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  rightIconButton: PropTypes.node,
};

export const MainSmallListItem = (props) => (
  <MUIListItem
    primaryText={props.primaryText}
    secondaryText={props.secondaryText}
    leftAvatar={props.leftAvatar}
    leftIcon={props.leftIcon}
    rightIcon={props.rightIcon}
    nestedItems={props.nestedItems}
    onClick={props.onClick}
    initiallyOpen={true}
    disabled={props.disabled}
    style={props.disabled ? styles.mainsmallitemdisabled : styles.mainsmallitem}
    rightIconButton={props.rightIconButton}
  />
);

MainSmallListItem.propTypes = {
  primaryText: PropTypes.node,
  secondaryText: PropTypes.node,
  leftAvatar: PropTypes.element,
  leftIcon: PropTypes.element,
  rightIcon: PropTypes.element,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  rightIconButton: PropTypes.node,
  nestedItems: PropTypes.arrayOf(PropTypes.node),
};

export const HeaderItem = (props) => (
  <MUIListItem
    primaryText={props.primaryText}
    secondaryText={props.secondaryText}
    leftIcon={props.leftIcon}
    rightIcon={props.rightIcon}
    onClick={props.onClick}
    disabled={props.disabled}
    nestedItems={props.nestedItems}
    initiallyOpen={true}
    style={styles.headeritem}
    innerDivStyle={{ padding: '20px 10px 20px 60px' }}
    hoverColor="#ffffff"
    disableKeyboardFocus={true}
    rightIconButton={props.rightIconButton}
  />
);

HeaderItem.propTypes = {
  primaryText: PropTypes.node,
  secondaryText: PropTypes.node,
  leftIcon: PropTypes.element,
  rightIcon: PropTypes.element,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  rightIconButton: PropTypes.element,
  nestedItems: PropTypes.arrayOf(PropTypes.node),
};
