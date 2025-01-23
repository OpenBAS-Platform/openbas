import { ListItemIcon, ListItemText, MenuItem } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React from 'react';
import { Link, useLocation } from 'react-router';

import { useFormatter } from '../../../i18n';
import { LeftMenuItem } from './leftmenu-model';
import StyledTooltip from './StyledTooltip';

const useStyles = makeStyles(() => ({
  menuItem: {
    paddingRight: 2,
    height: 35,
  },
  menuItemText: {
    padding: '1px 0 0 15px',
    fontWeight: 500,
    fontSize: 14,
  },
}));

interface Props {
  navOpen: boolean;
  item: LeftMenuItem;
}

const MenuItemSingle: React.FC<Props> = ({ navOpen, item }) => {
  // Standard hooks
  const classes = useStyles();
  const { t } = useFormatter();
  const location = useLocation();

  const isCurrentTab = location.pathname === item.path;
  return (
    <StyledTooltip title={!navOpen && t(item.label)} placement="right">
      <MenuItem
        aria-label={t(item.label)}
        component={Link}
        to={item.path}
        selected={isCurrentTab}
        dense
        classes={{ root: classes.menuItem }}
      >
        <ListItemIcon style={{ minWidth: 20 }}>
          {item.icon()}
        </ListItemIcon>
        {navOpen && (
          <ListItemText
            classes={{ primary: classes.menuItemText }}
            primary={t(item.label)}
          />
        )}
      </MenuItem>
    </StyledTooltip>
  );
};

export default MenuItemSingle;
