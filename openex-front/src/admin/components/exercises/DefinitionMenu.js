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
  CastForEducationOutlined,
  EmojiEventsOutlined,
} from '@mui/icons-material';
import { NewspaperVariantMultipleOutline } from 'mdi-material-ui';
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

class DefinitionMenu extends Component {
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
            to={`/admin/exercises/${exerciseId}/definition/audiences`}
            selected={
              location.pathname
              === `/admin/exercises/${exerciseId}/definition/audiences`
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
            to={`/admin/exercises/${exerciseId}/definition/media`}
            selected={
              location.pathname
              === `/admin/exercises/${exerciseId}/definition/media`
            }
            classes={{ root: classes.item }}
          >
            <ListItemIcon>
              <NewspaperVariantMultipleOutline />
            </ListItemIcon>
            <ListItemText primary={t('Media pressure')} />
          </MenuItem>
          <MenuItem
            component={Link}
            to={`/admin/exercises/${exerciseId}/definition/challenges`}
            selected={
              location.pathname
              === `/admin/exercises/${exerciseId}/definition/challenges`
            }
            classes={{ root: classes.item }}
          >
            <ListItemIcon>
              <EmojiEventsOutlined />
            </ListItemIcon>
            <ListItemText primary={t('Challenges')} />
          </MenuItem>
        </MenuList>
      </Drawer>
    );
  }
}

DefinitionMenu.propTypes = {
  classes: PropTypes.object,
  location: PropTypes.object,
  t: PropTypes.func,
  exerciseId: PropTypes.string,
};

export default compose(
  inject18n,
  withRouter,
  withStyles(styles),
)(DefinitionMenu);
