import React, {PropTypes} from 'react';
import MUIListItem from 'material-ui/List/ListItem';
import {injectIntl} from 'react-intl'

const ListItemLinkIntl = (props) => (
  <MUIListItem
    primaryText={props.intl.formatMessage({id: props.label})}
    href={props.to}
    leftIcon={props.leftIcon}
    disabled={props.disabled}/>
);
export const ListItemLink = injectIntl(ListItemLinkIntl)

ListItemLinkIntl.propTypes = {
  label: PropTypes.string,
  intl: PropTypes.object,
  to: PropTypes.string,
  leftIcon: PropTypes.element,
  disabled: PropTypes.bool
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
    href={props.to}
    disabled={props.disabled}
    leftIcon={props.leftIcon}
    innerDivStyle={{padding: '20px 10px 20px 10px'}}/>
);

IconListItemLink.propTypes = {
  intl: PropTypes.object,
  to: PropTypes.string,
  leftIcon: PropTypes.element,
  disabled: PropTypes.bool
}
