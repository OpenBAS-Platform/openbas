import React from 'react';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import { withRouter, Link } from 'react-router-dom';
import withStyles from '@mui/styles/withStyles';
import Drawer from '@mui/material/Drawer';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import {
  DashboardOutlined,
  RowingOutlined,
  GroupsOutlined,
  DescriptionOutlined,
  ExtensionOutlined,
  SettingsOutlined,
  DomainOutlined,
} from '@mui/icons-material';
import { connect } from 'react-redux';
import inject18n from '../../../components/i18n';

const styles = (theme) => ({
  drawerPaper: {
    minHeight: '100vh',
    width: 180,
    background: 0,
    backgroundColor: theme.palette.background.header,
  },
  menuList: {
    height: '100%',
  },
  lastItem: {
    bottom: 0,
  },
  logoButton: {
    marginLeft: -23,
    marginRight: 20,
  },
  logo: {
    cursor: 'pointer',
    height: 35,
  },
  toolbar: theme.mixins.toolbar,
  menuItem: {
    height: 40,
    padding: '6px 10px 6px 10px',
  },
  menuItemNested: {
    height: 40,
    padding: '6px 10px 6px 25px',
  },
});

const LeftBar = ({
  location, classes, userAdmin, t,
}) => (
  <Drawer variant="permanent" classes={{ paper: classes.drawerPaper }}>
    <Toolbar />
    <MenuList component="nav">
      <MenuItem
        component={Link}
        to="/"
        selected={location.pathname === '/'}
        dense={false}
        classes={{ root: classes.menuItem }}
      >
        <ListItemIcon style={{ minWidth: 35 }}>
          <DashboardOutlined />
        </ListItemIcon>
        <ListItemText primary={t('Dashboard')} />
      </MenuItem>
      <MenuItem
        component={Link}
        to="/exercises"
        selected={location.pathname.includes('/exercises')}
        dense={false}
        classes={{ root: classes.menuItem }}
      >
        <ListItemIcon style={{ minWidth: 35 }}>
          <RowingOutlined />
        </ListItemIcon>
        <ListItemText primary={t('Exercises')} />
      </MenuItem>
      <MenuItem
        component={Link}
        to="/players"
        selected={location.pathname === '/players'}
        dense={false}
        classes={{ root: classes.menuItem }}
      >
        <ListItemIcon style={{ minWidth: 35 }}>
          <GroupsOutlined />
        </ListItemIcon>
        <ListItemText primary={t('Players')} />
      </MenuItem>
      <MenuItem
        component={Link}
        to="/organizations"
        selected={location.pathname === '/organizations'}
        dense={false}
        classes={{ root: classes.menuItem }}
      >
        <ListItemIcon style={{ minWidth: 35 }}>
          <DomainOutlined />
        </ListItemIcon>
        <ListItemText primary={t('Organizations')} />
      </MenuItem>
      <MenuItem
        component={Link}
        to="/documents"
        selected={location.pathname === '/documents'}
        dense={false}
        classes={{ root: classes.menuItem }}
      >
        <ListItemIcon style={{ minWidth: 35 }}>
          <DescriptionOutlined />
        </ListItemIcon>
        <ListItemText primary={t('Documents')} />
      </MenuItem>
    </MenuList>
    <Divider />
    <MenuList component="nav">
      <MenuItem
        component={Link}
        to="/integrations"
        selected={location.pathname === '/integrations'}
        dense={false}
        classes={{ root: classes.menuItem }}
      >
        <ListItemIcon style={{ minWidth: 35 }}>
          <ExtensionOutlined />
        </ListItemIcon>
        <ListItemText primary={t('Integrations')} />
      </MenuItem>
      {userAdmin && (
        <MenuItem
          component={Link}
          to="/settings"
          selected={location.pathname.includes('/settings')}
          dense={false}
          classes={{ root: classes.menuItem }}
        >
          <ListItemIcon style={{ minWidth: 35 }}>
            <SettingsOutlined />
          </ListItemIcon>
          <ListItemText primary={t('Settings')} />
        </MenuItem>
      )}
    </MenuList>
  </Drawer>
);

LeftBar.propTypes = {
  location: PropTypes.object,
  classes: PropTypes.object,
  t: PropTypes.func,
  userAdmin: PropTypes.bool,
};

const select = (state) => {
  const userId = R.path(['logged', 'user'], state.app);
  return {
    userAdmin: R.path([userId, 'user_admin'], state.referential.entities.users),
  };
};

export default R.compose(
  connect(select),
  inject18n,
  withRouter,
  withStyles(styles),
)(LeftBar);
