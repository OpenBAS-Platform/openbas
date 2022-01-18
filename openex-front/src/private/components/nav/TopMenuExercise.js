import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import { withStyles } from '@mui/styles';
import { compose } from 'ramda';
import Button from '@mui/material/Button';
import { RowingOutlined, ArrowForwardIosOutlined } from '@mui/icons-material';
import inject18n from '../../../components/i18n';

const styles = (theme) => ({
  buttonHome: {
    marginRight: theme.spacing(2),
    padding: '2px 5px 2px 5px',
    minHeight: 20,
    textTransform: 'none',
    color: '#666666',
    backgroundColor: '#ffffff',
  },
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
  arrow: {
    verticalAlign: 'middle',
    marginRight: 10,
  },
});

class TopMenuExercise extends Component {
  render() {
    const {
      t,
      classes,
      location,
      match: {
        params: { exerciseId },
      },
    } = this.props;
    return (
      <div>
        <Button
          component={Link}
          to="/exercises"
          variant="contained"
          size="small"
          color="inherit"
          classes={{ root: classes.buttonHome }}
        >
          <RowingOutlined className={classes.icon} fontSize="small" />
          {t('Exercises')}
        </Button>
        <ArrowForwardIosOutlined
          color="inherit"
          classes={{ root: classes.arrow }}
        />
        <Button
          component={Link}
          to={`/exercises/${exerciseId}`}
          variant={
            location.pathname === `/exercises/${exerciseId}`
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname === `/exercises/${exerciseId}`
              ? 'secondary'
              : 'inherit'
          }
          classes={{ root: classes.button }}
        >
          {t('Overview')}
        </Button>
        <Button
          component={Link}
          to={`/exercises/${exerciseId}/animation`}
          variant={
            location.pathname.includes(`/exercises/${exerciseId}/animation`)
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname.includes(`/exercises/${exerciseId}/animation`)
              ? 'secondary'
              : 'inherit'
          }
          classes={{ root: classes.button }}
        >
          {t('Animation')}
        </Button>
        <Button
          component={Link}
          to={`/exercises/${exerciseId}/audiences`}
          variant={
            location.pathname.includes(`/exercises/${exerciseId}/audiences`)
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname.includes(`/exercises/${exerciseId}/audiences`)
              ? 'secondary'
              : 'inherit'
          }
          classes={{ root: classes.button }}
        >
          {t('Audiences')}
        </Button>
        <Button
          component={Link}
          to={`/exercises/${exerciseId}/scenario`}
          variant={
            location.pathname === `/exercises/${exerciseId}/scenario`
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname === `/exercises/${exerciseId}/scenario`
              ? 'secondary'
              : 'inherit'
          }
          classes={{ root: classes.button }}
        >
          {t('Scenario')}
        </Button>
        <Button
          component={Link}
          to={`/exercises/${exerciseId}/controls`}
          variant={
            location.pathname.includes(`/exercises/${exerciseId}/controls`)
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname.includes(`/exercises/${exerciseId}/controls`)
              ? 'secondary'
              : 'inherit'
          }
          classes={{ root: classes.button }}
        >
          {t('Controls')}
        </Button>
        <Button
          component={Link}
          to={`/exercises/${exerciseId}/lessons`}
          variant={
            location.pathname === `/exercises/${exerciseId}/lessons`
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname === `/exercises/${exerciseId}/lessons`
              ? 'secondary'
              : 'inherit'
          }
          classes={{ root: classes.button }}
        >
          {t('Lessons learned')}
        </Button>
      </div>
    );
  }
}

TopMenuExercise.propTypes = {
  classes: PropTypes.object,
  location: PropTypes.object,
  match: PropTypes.object,
  t: PropTypes.func,
  history: PropTypes.object,
};

export default compose(
  inject18n,
  withRouter,
  withStyles(styles),
)(TopMenuExercise);
