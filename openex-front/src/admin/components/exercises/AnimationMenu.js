import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import { compose } from 'ramda';
import withStyles from '@mui/styles/withStyles';
import Drawer from '@mui/material/Drawer';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import {
  TheatersOutlined,
  FactCheckOutlined,
  MailOutlined,
  ForumOutlined,
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

class AnimationMenu extends Component {
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
            to={`/admin/exercises/${exerciseId}/animation/timeline`}
            selected={
              location.pathname
              === `/admin/exercises/${exerciseId}/animation/timeline`
            }
            classes={{ root: classes.item }}
          >
            <ListItemIcon>
              <TheatersOutlined />
            </ListItemIcon>
            <ListItemText primary={t('Timeline')} />
          </MenuItem>
          <MenuItem
            component={Link}
            to={`/admin/exercises/${exerciseId}/animation/mails`}
            selected={
              location.pathname
              === `/admin/exercises/${exerciseId}/animation/mails`
            }
            classes={{ root: classes.item }}
          >
            <ListItemIcon>
              <MailOutlined />
            </ListItemIcon>
            <ListItemText primary={t('Mails')} />
          </MenuItem>
          <MenuItem
            component={Link}
            to={`/admin/exercises/${exerciseId}/animation/chat`}
            selected={
              location.pathname
              === `/admin/exercises/${exerciseId}/animation/chat`
            }
            classes={{ root: classes.item }}
          >
            <ListItemIcon>
              <ForumOutlined />
            </ListItemIcon>
            <ListItemText primary={t('Chat')} />
          </MenuItem>
          <MenuItem
            component={Link}
            to={`/admin/exercises/${exerciseId}/animation/validations`}
            selected={
              location.pathname
              === `/admin/exercises/${exerciseId}/animation/validations`
            }
            classes={{ root: classes.item }}
          >
            <ListItemIcon>
              <FactCheckOutlined />
            </ListItemIcon>
            <ListItemText primary={t('Validations')} />
          </MenuItem>
        </MenuList>
      </Drawer>
    );
  }
}

AnimationMenu.propTypes = {
  classes: PropTypes.object,
  location: PropTypes.object,
  t: PropTypes.func,
  exerciseId: PropTypes.string,
};

export default compose(
  inject18n,
  withRouter,
  withStyles(styles),
)(AnimationMenu);
