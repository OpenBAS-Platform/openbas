import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Drawer, MenuList, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { GroupsOutlined, PermIdentityOutlined } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import { useFormatter } from '../../../components/i18n';
import type { Theme } from '../../../components/Theme';

const useStyles = makeStyles((theme: Theme) => ({
  drawer: {
    minHeight: '100vh',
    width: 200,
    position: 'fixed',
    overflow: 'auto',
    padding: 0,
  },
  toolbar: theme.mixins.toolbar,
  item: {
    paddingTop: 10,
    paddingBottom: 10,
  },
}));

const DefinitionMenu: React.FC = () => {
  const location = useLocation();
  const classes = useStyles();
  const { t } = useFormatter();
  return (
    <Drawer
      variant="permanent"
      anchor="right"
      classes={{ paper: classes.drawer }}
    >
      <div className={classes.toolbar} />
      <MenuList component="nav">
        <MenuItem
          component={Link}
          to='/admin/settings/security/groups'
          selected={location.pathname === '/admin/settings/security/groups'}
          classes={{ root: classes.item }}
        >
          <ListItemIcon>
            <GroupsOutlined />
          </ListItemIcon>
          <ListItemText primary={t('Groups')} />
        </MenuItem>
        <MenuItem
          component={Link}
          to='/admin/settings/security/users'
          selected={location.pathname === '/admin/settings/security/users'}
          classes={{ root: classes.item }}
        >
          <ListItemIcon>
            <PermIdentityOutlined />
          </ListItemIcon>
          <ListItemText primary={t('Users')} />
        </MenuItem>
      </MenuList>
    </Drawer>
  );
};

export default DefinitionMenu;
