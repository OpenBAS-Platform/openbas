import { ListItemIcon, ListItemText, MenuItem } from '@mui/material';
import { type FunctionComponent } from 'react';
import { Link, useLocation } from 'react-router';

import { useFormatter } from '../../../i18n';
import { type LeftMenuItem } from './leftmenu-model';
import StyledTooltip from './StyledTooltip';
import { ADMIN_PATH } from '../../../../admin/components/nav/LeftBar';

interface Props {
  navOpen: boolean;
  item: LeftMenuItem;
}

const MenuItemSingle: FunctionComponent<Props> = ({ navOpen, item }) => {
  // Standard hooks
  const { t } = useFormatter();
  const location = useLocation();

  let isCurrentTab;

  if (ADMIN_PATH === item.path) {
    isCurrentTab = location.pathname === item.path;
  } else {
    isCurrentTab = location.pathname.includes(item.path);
  }

  return (
    <StyledTooltip title={!navOpen && t(item.label)} placement="right">
      <MenuItem
        aria-label={t(item.label)}
        component={Link}
        to={item.path}
        selected={isCurrentTab}
        dense
        sx={{
          paddingRight: '2px',
          height: 35,
        }}
      >
        <ListItemIcon style={{ minWidth: 20 }}>
          {item.icon()}
        </ListItemIcon>
        {navOpen && (
          <ListItemText
            primary={t(item.label)}
            sx={{ pl: 1 }}
            slotProps={{
              primary: {
                fontWeight: 500,
                fontSize: 14,
              },
            }}
          />
        )}
      </MenuItem>
    </StyledTooltip>
  );
};

export default MenuItemSingle;
