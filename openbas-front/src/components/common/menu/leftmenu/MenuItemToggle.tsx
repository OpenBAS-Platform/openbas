import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { ListItemIcon, ListItemText, MenuItem } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React from 'react';

import { useFormatter } from '../../../i18n';

const useStyles = makeStyles(() => ({
  menuItemText: {
    padding: '1px 0 0 15px',
    fontWeight: 500,
    fontSize: 14,
  },
}));

interface Props {
  navOpen: boolean;
  onClick: () => void;
}

const MenuItemToggle: React.FC<Props> = ({ navOpen, onClick }) => {
  // Standard hooks
  const classes = useStyles();
  const { t } = useFormatter();

  return (
    <MenuItem
      dense
      onClick={onClick}
      aria-label={navOpen ? 'Collapse menu' : 'Expand menu'}
    >
      <ListItemIcon style={{ minWidth: 20 }}>
        {navOpen ? <ChevronLeft /> : <ChevronRight />}
      </ListItemIcon>
      {navOpen && (
        <ListItemText
          classes={{ primary: classes.menuItemText }}
          primary={t('Collapse')}
        />
      )}
    </MenuItem>
  );
};

export default MenuItemToggle;
