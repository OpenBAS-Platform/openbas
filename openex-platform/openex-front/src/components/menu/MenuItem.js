import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import MenuItem from 'material-ui/MenuItem';
import { injectIntl } from 'react-intl';

const MenuItemLinkIntl = (props) => (
  <MenuItem
    primaryText={
      props.label ? props.intl.formatMessage({ id: props.label }) : ''
    }
    containerElement={<Link to={props.to} />}
    disabled={props.disabled}
    value={props.value}
    onClick={props.onClick}
  />
);
export const MenuItemLink = injectIntl(MenuItemLinkIntl);

MenuItemLinkIntl.propTypes = {
  label: PropTypes.oneOfType([
    PropTypes.string.isRequired,
    PropTypes.object.isRequired,
  ]),
  to: PropTypes.string,
  disabled: PropTypes.bool,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onClick: PropTypes.func,
  intl: PropTypes.object,
};

const MenuItemButtonIntl = (props) => (
  <MenuItem
    primaryText={props.intl.formatMessage({ id: props.label })}
    onClick={props.onClick}
    disabled={props.disabled}
  />
);
export const MenuItemButton = injectIntl(MenuItemButtonIntl);

MenuItemButtonIntl.propTypes = {
  label: PropTypes.string.isRequired,
  intl: PropTypes.object,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
};
