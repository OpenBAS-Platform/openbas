import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import { compose } from 'ramda';
import withStyles from '@mui/styles/withStyles';
import Drawer from '@mui/material/Drawer';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { TheatersOutlined } from '@mui/icons-material';
import inject18n from '../../../components/i18n';

const styles = (theme) => ({
  drawer: {
    minHeight: '100vh',
    width: 200,
    position: 'fixed',
    overflow: 'auto',
    padding: 0,
    backgroundColor: theme.palette.background.navLight,
  },
  toolbar: theme.mixins.toolbar,
});

class LessonsMenu extends Component {
  render() {
    const { t, location, classes, exerciseId } = this.props;
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
            to={`/admin/exercises/${exerciseId}/lessons/dashboard`}
            selected={
              location.pathname
              === `/admin/exercises/${exerciseId}/lessons/dashboard`
            }
            dense={false}
          >
            <ListItemIcon style={{ minWidth: 35 }}>
              <TheatersOutlined />
            </ListItemIcon>
            <ListItemText primary={t('Dashboard')} />
          </MenuItem>
          <MenuItem
            component={Link}
            to={`/admin/exercises/${exerciseId}/lessons/scores`}
            selected={
              location.pathname
              === `/admin/exercises/${exerciseId}/lessons/scores`
            }
            dense={false}
          >
            <ListItemIcon style={{ minWidth: 35 }}>
              <TheatersOutlined />
            </ListItemIcon>
            <ListItemText primary={t('Scores')} />
          </MenuItem>
          <MenuItem
            component={Link}
            to={`/admin/exercises/${exerciseId}/lessons/reports`}
            selected={
              location.pathname
              === `/admin/exercises/${exerciseId}/lessons/reports`
            }
            dense={false}
          >
            <ListItemIcon style={{ minWidth: 35 }}>
              <TheatersOutlined />
            </ListItemIcon>
            <ListItemText primary={t('Reports')} />
          </MenuItem>
        </MenuList>
      </Drawer>
    );
  }
}

LessonsMenu.propTypes = {
  classes: PropTypes.object,
  location: PropTypes.object,
  t: PropTypes.func,
  exerciseId: PropTypes.string,
};

export default compose(inject18n, withRouter, withStyles(styles))(LessonsMenu);
