import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';
import { withStyles } from '@mui/styles';
import { compose } from 'ramda';
import Button from '@mui/material/Button';
import inject18n from '../../../components/i18n';

const styles = (theme) => ({
  button: {
    marginRight: theme.spacing(1),
    padding: '2px 5px 2px 5px',
    minHeight: 20,
    textTransform: 'none',
  },
  bar: {
    width: '100%',
  },
  right: {
    marginRight: theme.spacing(1),
    padding: '2px 5px 2px 5px',
    minHeight: 20,
    textTransform: 'none',
    float: 'right',
  },
});

class TopMenuExercises extends Component {
  render() {
    const { t, location, classes } = this.props;
    return (
      <div className={classes.bar}>
        <Button
          component={Link}
          to="/"
          variant={location.pathname === '/exercises' ? 'contained' : 'text'}
          size="small"
          color={location.pathname === '/exercises' ? 'secondary' : 'inherit'}
          classes={{ root: classes.button }}
        >
          {t('Exercises')}
        </Button>
        {/*
                <Button component={ImportUploader} classes={{root: classes.button}}>
                  {t('Import exercise')}
                </Button>
                */}
      </div>
    );
  }
}

TopMenuExercises.propTypes = {
  classes: PropTypes.object,
  location: PropTypes.object,
  t: PropTypes.func,
  history: PropTypes.object,
};

export default compose(
  inject18n,
  withRouter,
  withStyles(styles),
)(TopMenuExercises);
