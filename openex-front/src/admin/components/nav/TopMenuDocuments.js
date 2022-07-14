import React, { Component } from 'react';
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
});

class TopMenuDashboard extends Component {
  render() {
    const { t, location, classes } = this.props;
    return (
      <div>
        <Button
          component={Link}
          to="/admin"
          variant={
            location.pathname === '/admin/documents' ? 'contained' : 'text'
          }
          size="small"
          color={
            location.pathname === '/admin/documents' ? 'secondary' : 'primary'
          }
          classes={{ root: classes.button }}
        >
          {t('Documents')}
        </Button>
      </div>
    );
  }
}

TopMenuDashboard.propTypes = {
  classes: PropTypes.object,
  location: PropTypes.object,
  t: PropTypes.func,
  history: PropTypes.object,
};

export default compose(
  inject18n,
  withRouter,
  withStyles(styles),
)(TopMenuDashboard);
