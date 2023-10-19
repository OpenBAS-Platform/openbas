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
    padding: '0 5px 0 5px',
    minHeight: 20,
    minWidth: 20,
    textTransform: 'none',
  },
  icon: {
    marginRight: theme.spacing(1),
  },
});

const TopMenuProfile = ({ t, location, classes }) => (
  <div>
    <Button
      component={Link}
      to="/admin/profile"
      variant={location.pathname === '/admin/profile' ? 'contained' : 'text'}
      size="small"
      color={location.pathname === '/admin/profile' ? 'secondary' : 'primary'}
      classes={{ root: classes.button }}
    >
      {t('Profile')}
    </Button>
  </div>
);

TopMenuProfile.propTypes = {
  classes: PropTypes.object,
  location: PropTypes.object,
  t: PropTypes.func,
  history: PropTypes.object,
};

export default compose(
  inject18n,
  withRouter,
  withStyles(styles),
)(TopMenuProfile);
