import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Drawer from '@mui/material/Drawer';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import {
  DashboardOutlined,
  PersonOutlined,
  GroupOutlined,
} from '@mui/icons-material';
import withStyles from '@mui/styles/withStyles';
import { T } from '../../../../components/I18n';
import { i18nRegister } from '../../../../utils/Messages';

i18nRegister({
  fr: {
    Home: 'Accueil',
    Unfolding: 'Déroulement',
    Execution: 'Exécution',
    Lessons: 'Expérience',
    Checks: 'Vérifications',
    Configuration: 'Configuration',
    Objectives: 'Objectifs',
    Scenario: 'Scénario',
    Audiences: 'Audiences',
    Documents: 'Documents',
    Statistics: 'Statistiques',
    Settings: 'Paramètres',
  },
});

const styles = () => ({
  drawerPaper: {
    width: 180,
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
  menuItem: {
    height: 40,
    padding: '6px 10px 6px 10px',
  },
  menuItemNested: {
    height: 40,
    padding: '6px 10px 6px 25px',
  },
});

class LeftBar extends Component {
  render() {
    const { classes, pathname } = this.props;
    return (
      <Drawer variant="permanent" classes={{ paper: classes.drawerPaper }}>
        <Toolbar />
        <MenuList component="nav">
          <MenuItem
            component={Link}
            to={'/private/admin'}
            selected={pathname === '/private/admin'}
            dense={false}
            classes={{ root: classes.menuItem }}
          >
            <ListItemIcon style={{ minWidth: 35 }}>
              <DashboardOutlined />
            </ListItemIcon>
            <ListItemText primary={<T>Home</T>} />
          </MenuItem>
          <MenuItem
            component={Link}
            to={'/private/admin/users'}
            selected={pathname === '/private/admin/users'}
            dense={false}
            classes={{ root: classes.menuItem }}
          >
            <ListItemIcon style={{ minWidth: 35 }}>
              <PersonOutlined />
            </ListItemIcon>
            <ListItemText primary={<T>Users</T>} />
          </MenuItem>
          <MenuItem
            component={Link}
            to={'/private/admin/groups'}
            selected={pathname === '/private/admin/groups'}
            dense={false}
            classes={{ root: classes.menuItem }}
          >
            <ListItemIcon style={{ minWidth: 35 }}>
              <GroupOutlined />
            </ListItemIcon>
            <ListItemText primary={<T>Groups</T>} />
          </MenuItem>
        </MenuList>
      </Drawer>
    );
  }
}

LeftBar.propTypes = {
  pathname: PropTypes.string.isRequired,
};

export default withStyles(styles)(LeftBar);
