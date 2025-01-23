import { Collapse, ListItemIcon, ListItemText, MenuItem, MenuList, Popover } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { FunctionComponent } from 'react';
import { Link, useLocation } from 'react-router';

import { useFormatter } from '../../../i18n';
import { LeftMenuSubItem } from './leftmenu-model';
import StyledTooltip from './StyledTooltip';
import { LeftMenuHelpers, LeftMenuState } from './useLeftMenu';

const useStyles = makeStyles(() => ({
  menuSubItem: {
    paddingLeft: 20,
  },
  menuSubItemText: {
    padding: '1px 0 0 10px',
    fontWeight: 500,
    fontSize: 12,
  },
  menuItemText: {
    padding: '1px 0 0 15px',
    fontWeight: 500,
    fontSize: 14,
  },
}));

interface Props {
  menu: string;
  subItems: LeftMenuSubItem[] | undefined;
  state: LeftMenuState;
  helpers: LeftMenuHelpers;
}

const MenuItemSub: FunctionComponent<Props> = ({
  menu,
  subItems = [],
  state,
  helpers,
}) => {
  // Standard hooks
  const { t } = useFormatter();
  const classes = useStyles();
  const location = useLocation();

  const { navOpen, selectedMenu, anchors } = state;
  const { handleSelectedMenuOpen, handleSelectedMenuClose } = helpers;

  const renderMenuItem = ({ label, link, exact, icon }: LeftMenuSubItem) => {
    const isCurrentTab = location.pathname === link;
    return (
      <MenuItem
        key={label}
        aria-label={t(label)}
        component={Link}
        to={link}
        selected={exact ? isCurrentTab : location.pathname.includes(link)}
        dense
        classes={{ root: navOpen ? classes.menuSubItem : undefined }}
        onClick={!navOpen ? handleSelectedMenuClose : undefined}
      >
        {icon && (
          <ListItemIcon style={{ minWidth: 20 }}>
            {icon()}
          </ListItemIcon>
        )}
        <ListItemText
          classes={{ primary: navOpen ? classes.menuSubItemText : classes.menuItemText }}
          primary={t(label)}
        />
      </MenuItem>
    );
  };

  if (navOpen) {
    return (
      <Collapse in={selectedMenu === menu} timeout="auto" unmountOnExit>
        <MenuList component="nav" disablePadding>
          {subItems.map(items => (
            <StyledTooltip key={items.label} title={t(items.label)} placement="right">
              {renderMenuItem(items)}
            </StyledTooltip>
          ))}
        </MenuList>
      </Collapse>
    );
  }

  return (
    <Popover
      sx={{ pointerEvents: 'none' }}
      open={selectedMenu === menu}
      anchorEl={anchors[menu]?.current}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      onClose={handleSelectedMenuClose}
      disableRestoreFocus
      disableScrollLock
      slotProps={{
        paper: {
          elevation: 1,
          onMouseEnter: () => handleSelectedMenuOpen(menu),
          onMouseLeave: handleSelectedMenuClose,
          sx: {
            pointerEvents: 'auto',
          },
        },
      }}
    >
      <MenuList component="nav">
        {subItems.map(entry => renderMenuItem(entry))}
      </MenuList>
    </Popover>
  );
};

export default MenuItemSub;
