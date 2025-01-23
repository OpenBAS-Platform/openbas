import { ExpandLessOutlined, ExpandMoreOutlined } from '@mui/icons-material';
import { ListItemIcon, ListItemText, MenuItem } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React from 'react';
import { useLocation } from 'react-router';

import useDimensions from '../../../../utils/hooks/useDimensions';
import { useFormatter } from '../../../i18n';
import { LeftMenuItemWithHref } from './leftmenu-model';
import SubMenu from './MenuItemSub';
import { LeftMenuHelpers, LeftMenuState } from './useLeftMenu';

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
  item: LeftMenuItemWithHref;
  state: LeftMenuState;
  helpers: LeftMenuHelpers;
}

const MenuItemGroup: React.FC<Props> = ({ item, state, helpers }) => {
  // Standard hooks
  const classes = useStyles();
  const { t } = useFormatter();
  const location = useLocation();
  const { dimension } = useDimensions();
  const isMobile = dimension.width < 768;

  const { navOpen, selectedMenu, anchors } = state;
  const { handleSelectedMenuOpen, handleSelectedMenuClose, handleSelectedMenuToggle, handleGoToPage } = helpers;

  const isCurrentTab = location.pathname === item.path;
  return (
    <>
      <MenuItem
        ref={anchors[item.href]}
        aria-haspopup="menu"
        aria-expanded={selectedMenu === item.href}
        aria-label={t(item.label)}
        selected={isCurrentTab}
        dense
        classes={{ root: classes.menuItem }}
        onClick={() => (isMobile || navOpen ? handleSelectedMenuToggle(item.href) : handleGoToPage(item.path))}
        onMouseEnter={() => !navOpen && handleSelectedMenuOpen(item.href)}
        onMouseLeave={() => !navOpen && handleSelectedMenuClose()}
      >
        <ListItemIcon style={{ minWidth: 20 }}>
          {item.icon()}
        </ListItemIcon>
        {navOpen && (
          <>
            <ListItemText
              classes={{ primary: classes.menuItemText }}
              primary={t(item.label)}
            />
            {selectedMenu === item.href ? <ExpandLessOutlined /> : <ExpandMoreOutlined />}
          </>
        )}
      </MenuItem>
      <SubMenu
        menu={item.href}
        subItems={item.subItems}
        state={state}
        helpers={helpers}
      />
    </>
  );
};

export default MenuItemGroup;
