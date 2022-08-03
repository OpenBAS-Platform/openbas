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
  InsertChartOutlinedOutlined,
  SchoolOutlined,
  ContentPasteOutlined,
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

class ResultsMenu extends Component {
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
            to={`/admin/exercises/${exerciseId}/results/dashboard`}
            selected={
              location.pathname
              === `/admin/exercises/${exerciseId}/results/dashboard`
            }
            dense={false}
            classes={{ root: classes.item }}
          >
            <ListItemIcon style={{ minWidth: 35 }}>
              <InsertChartOutlinedOutlined />
            </ListItemIcon>
            <ListItemText primary={t('Statistics')} />
          </MenuItem>
          <MenuItem
            component={Link}
            to={`/admin/exercises/${exerciseId}/results/lessons`}
            selected={
              location.pathname
              === `/admin/exercises/${exerciseId}/results/lessons`
            }
            dense={false}
            classes={{ root: classes.item }}
          >
            <ListItemIcon style={{ minWidth: 35 }}>
              <SchoolOutlined />
            </ListItemIcon>
            <ListItemText primary={t('Lessons learned')} />
          </MenuItem>
          <MenuItem
            component={Link}
            to={`/admin/exercises/${exerciseId}/results/reports`}
            selected={
              location.pathname
              === `/admin/exercises/${exerciseId}/results/reports`
            }
            dense={false}
            classes={{ root: classes.item }}
            disabled={true}
          >
            <ListItemIcon style={{ minWidth: 35 }}>
              <ContentPasteOutlined />
            </ListItemIcon>
            <ListItemText primary={t('Reports')} />
          </MenuItem>
        </MenuList>
      </Drawer>
    );
  }
}

ResultsMenu.propTypes = {
  classes: PropTypes.object,
  location: PropTypes.object,
  t: PropTypes.func,
  exerciseId: PropTypes.string,
};

export default compose(inject18n, withRouter, withStyles(styles))(ResultsMenu);
