import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import Drawer from '@material-ui/core/Drawer';
import ListItemText from '@material-ui/core/ListItemText';
import Toolbar from '@material-ui/core/Toolbar';
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Collapse from '@material-ui/core/Collapse';
import {
  PublicOutlined,
  PlayCircleOutlineOutlined,
  SchoolOutlined,
  GraphicEqOutlined,
  ExpandLess,
  ExpandMore,
  NextWeekOutlined,
  FlagOutlined,
  LocalMoviesOutlined,
  GroupOutlined,
  DescriptionOutlined,
  SettingsOutlined,
  SettingsInputCompositeOutlined,
} from '@material-ui/icons';
import * as R from 'ramda';
import { withStyles } from '@material-ui/core/styles';
import { T } from '../../../../components/I18n';
import {
  redirectToExercise,
  toggleLeftUnfolding,
  toggleLeftConfiguration,
} from '../../../../actions/Application';
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

const styles = (theme) => ({
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

class LeftBar extends Component {
  handleToggleUnfolding() {
    this.props.toggleLeftUnfolding();
  }

  handleToggleConfiguration() {
    this.props.toggleLeftConfiguration();
  }

  redirectToHome() {
    this.props.redirectToExercise(this.props.id);
    this.handleToggle();
  }

  render() {
    const {
      classes, pathname, id, unfolding, configuration,
    } = this.props;
    return (
      <Drawer variant="permanent" classes={{ paper: classes.drawerPaper }}>
        <Toolbar />
        <MenuList component="nav">
          <MenuItem
            component={Link}
            to={`/private/exercise/${id}`}
            selected={pathname === `/private/exercise/${id}`}
            dense={false}
            classes={{ root: classes.menuItem }}
          >
            <ListItemIcon style={{ minWidth: 35 }}>
              <PublicOutlined />
            </ListItemIcon>
            <ListItemText primary={<T>Home</T>} />
          </MenuItem>
          <MenuItem
            dense={false}
            classes={{ root: classes.menuItem }}
            onClick={this.handleToggleUnfolding.bind(this)}
          >
            <ListItemIcon style={{ minWidth: 35 }}>
              <NextWeekOutlined />
            </ListItemIcon>
            <ListItemText primary={<T>Unfolding</T>} />
            {unfolding ? <ExpandLess /> : <ExpandMore />}
          </MenuItem>
          <Collapse in={unfolding}>
            <MenuList component="nav" disablePadding={true}>
              <MenuItem
                component={Link}
                to={`/private/exercise/${id}/execution`}
                selected={pathname.includes(
                  `/private/exercise/${id}/execution`,
                )}
                dense={false}
                classes={{ root: classes.menuItemNested }}
              >
                <ListItemIcon style={{ minWidth: 35 }}>
                  <PlayCircleOutlineOutlined />
                </ListItemIcon>
                <ListItemText primary={<T>Execution</T>} />
              </MenuItem>
              <MenuItem
                component={Link}
                to={`/private/exercise/${id}/lessons`}
                selected={pathname.includes(`/private/exercise/${id}/lessons`)}
                dense={false}
                classes={{ root: classes.menuItemNested }}
              >
                <ListItemIcon style={{ minWidth: 35 }}>
                  <SchoolOutlined />
                </ListItemIcon>
                <ListItemText primary={<T>Lessons</T>} />
              </MenuItem>
              <MenuItem
                component={Link}
                to={`/private/exercise/${this.props.id}/checks`}
                selected={pathname.includes(
                  `/private/exercise/${this.props.id}/checks`,
                )}
                dense={false}
                classes={{ root: classes.menuItemNested }}
              >
                <ListItemIcon style={{ minWidth: 35 }}>
                  <GraphicEqOutlined />
                </ListItemIcon>
                <ListItemText primary={<T>Checks</T>} />
              </MenuItem>
            </MenuList>
          </Collapse>
          <MenuItem
            dense={false}
            classes={{ root: classes.menuItem }}
            onClick={this.handleToggleConfiguration.bind(this)}
          >
            <ListItemIcon style={{ minWidth: 35 }}>
              <SettingsInputCompositeOutlined />
            </ListItemIcon>
            <ListItemText primary={<T>Configuration</T>} />
            {configuration ? <ExpandLess /> : <ExpandMore />}
          </MenuItem>
          <Collapse in={configuration}>
            <MenuList component="nav" disablePadding={true}>
              <MenuItem
                component={Link}
                to={`/private/exercise/${id}/objectives`}
                selected={pathname.includes(
                  `/private/exercise/${id}/objectives`,
                )}
                dense={false}
                classes={{ root: classes.menuItemNested }}
              >
                <ListItemIcon style={{ minWidth: 35 }}>
                  <FlagOutlined />
                </ListItemIcon>
                <ListItemText primary={<T>Objectives</T>} />
              </MenuItem>
              <MenuItem
                component={Link}
                to={`/private/exercise/${id}/scenario`}
                selected={pathname.includes(`/private/exercise/${id}/scenario`)}
                dense={false}
                classes={{ root: classes.menuItemNested }}
              >
                <ListItemIcon style={{ minWidth: 35 }}>
                  <LocalMoviesOutlined />
                </ListItemIcon>
                <ListItemText primary={<T>Scenario</T>} />
              </MenuItem>
              <MenuItem
                component={Link}
                to={`/private/exercise/${this.props.id}/audiences`}
                selected={pathname.includes(
                  `/private/exercise/${this.props.id}/audiences`,
                )}
                dense={false}
                classes={{ root: classes.menuItemNested }}
              >
                <ListItemIcon style={{ minWidth: 35 }}>
                  <GroupOutlined />
                </ListItemIcon>
                <ListItemText primary={<T>Audiences</T>} />
              </MenuItem>
              <MenuItem
                component={Link}
                to={`/private/exercise/${this.props.id}/documents`}
                selected={pathname.includes(
                  `/private/exercise/${this.props.id}/documents`,
                )}
                dense={false}
                classes={{ root: classes.menuItemNested }}
              >
                <ListItemIcon style={{ minWidth: 35 }}>
                  <DescriptionOutlined />
                </ListItemIcon>
                <ListItemText primary={<T>Documents</T>} />
              </MenuItem>
              <MenuItem
                component={Link}
                to={`/private/exercise/${this.props.id}/settings`}
                selected={pathname.includes(
                  `/private/exercise/${this.props.id}/settings`,
                )}
                dense={false}
                classes={{ root: classes.menuItemNested }}
              >
                <ListItemIcon style={{ minWidth: 35 }}>
                  <SettingsOutlined />
                </ListItemIcon>
                <ListItemText primary={<T>Settings</T>} />
              </MenuItem>
            </MenuList>
          </Collapse>
        </MenuList>
      </Drawer>
    );
  }
}

LeftBar.propTypes = {
  id: PropTypes.string.isRequired,
  exercise_type: PropTypes.string,
  pathname: PropTypes.string.isRequired,
  redirectToExercise: PropTypes.func,
  unfolding: PropTypes.bool,
  configuration: PropTypes.bool,
};

const select = (state) => ({
  unfolding: state.screen.navbar_left_unfolding,
  configuration: state.screen.navbar_left_configuration,
  loading: state.screen.loading || false,
});

export default R.compose(
  connect(select, {
    redirectToExercise,
    toggleLeftUnfolding,
    toggleLeftConfiguration,
  }),
  withStyles(styles),
)(LeftBar);
