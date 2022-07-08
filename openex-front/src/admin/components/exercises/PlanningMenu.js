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
import {
  MovieFilterOutlined,
  CastForEducationOutlined,
  NewspaperOutlined,
} from '@mui/icons-material';
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
  item: {
    paddingTop: 10,
    paddingBottom: 10,
  },
});

class PlanningMenu extends Component {
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
            to={`/admin/exercises/${exerciseId}/planning/scenario`}
            selected={
              location.pathname
              === `/admin/exercises/${exerciseId}/planning/scenario`
            }
            classes={{ root: classes.item }}
          >
            <ListItemIcon>
              <MovieFilterOutlined />
            </ListItemIcon>
            <ListItemText primary={t('Scenario')} />
          </MenuItem>
          <MenuItem
            component={Link}
            to={`/admin/exercises/${exerciseId}/planning/audiences`}
            selected={
              location.pathname
              === `/admin/exercises/${exerciseId}/planning/audiences`
            }
            classes={{ root: classes.item }}
          >
            <ListItemIcon>
              <CastForEducationOutlined />
            </ListItemIcon>
            <ListItemText primary={t('Audiences')} />
          </MenuItem>
          <MenuItem
            component={Link}
            to={`/admin/exercises/${exerciseId}/planning/media`}
            selected={
              location.pathname
              === `/admin/exercises/${exerciseId}/planning/media`
            }
            classes={{ root: classes.item }}
          >
            <ListItemIcon>
              <NewspaperOutlined />
            </ListItemIcon>
            <ListItemText primary={t('Media pressure')} />
          </MenuItem>
        </MenuList>
      </Drawer>
    );
  }
}

PlanningMenu.propTypes = {
  classes: PropTypes.object,
  location: PropTypes.object,
  t: PropTypes.func,
  exerciseId: PropTypes.string,
};

export default compose(inject18n, withRouter, withStyles(styles))(PlanningMenu);
