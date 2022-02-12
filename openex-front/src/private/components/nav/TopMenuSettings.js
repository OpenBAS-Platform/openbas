import React from 'react';
import * as PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import withStyles from '@mui/styles/withStyles';
import { compose } from 'ramda';
import Button from '@mui/material/Button';
import inject18n from '../../../components/i18n';

const styles = (theme) => ({
  button: {
    marginRight: theme.spacing(2),
    padding: '2px 5px 2px 5px',
    minHeight: 20,
    minWidth: 20,
    textTransform: 'none',
  },
  icon: {
    marginRight: theme.spacing(1),
  },
});

const TopMenuSettings = ({ t, location, classes }) => (
  <div>
    <Button
      component={Link}
      to="/settings"
      variant={location.pathname === '/settings' ? 'contained' : 'text'}
      size="small"
      color={location.pathname === '/settings' ? 'secondary' : 'inherit'}
      classes={{ root: classes.button }}
    >
      {t('Parameters')}
    </Button>
    <Button
      component={Link}
      to="/settings/users"
      variant={
        location.pathname.includes('/settings/users') ? 'contained' : 'text'
      }
      size="small"
      color={
        location.pathname.includes('/settings/users') ? 'secondary' : 'inherit'
      }
      classes={{ root: classes.button }}
    >
      {t('Users')}
    </Button>
    <Button
      component={Link}
      to="/settings/groups"
      variant={
        location.pathname.includes('/settings/groups') ? 'contained' : 'text'
      }
      size="small"
      color={
        location.pathname.includes('/settings/groups') ? 'secondary' : 'inherit'
      }
      classes={{ root: classes.button }}
    >
      {t('Groups')}
    </Button>
    <Button
      component={Link}
      to="/settings/tags"
      variant={
        location.pathname.includes('/settings/tags') ? 'contained' : 'text'
      }
      size="small"
      color={
        location.pathname.includes('/settings/tags') ? 'secondary' : 'inherit'
      }
      classes={{ root: classes.button }}
    >
      {t('Tags')}
    </Button>
  </div>
);

TopMenuSettings.propTypes = {
  classes: PropTypes.object,
  location: PropTypes.object,
  t: PropTypes.func,
  history: PropTypes.object,
};

export default compose(
  inject18n,
  withRouter,
  withStyles(styles),
)(TopMenuSettings);
