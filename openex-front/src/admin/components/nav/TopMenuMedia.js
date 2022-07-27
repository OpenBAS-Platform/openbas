import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import withStyles from '@mui/styles/withStyles';
import { compose } from 'ramda';
import Button from '@mui/material/Button';
import { NewspaperVariantMultipleOutline } from 'mdi-material-ui';
import { ArrowForwardIosOutlined } from '@mui/icons-material';
import inject18n from '../../../components/i18n';

const styles = (theme) => ({
  buttonHome: {
    marginRight: theme.spacing(2),
    padding: '0 5px 0 5px',
    minHeight: 20,
    textTransform: 'none',
  },
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
        params: { mediaId },
      },
    } = this.props;
    return (
      <div>
        <Button
          component={Link}
          to="/admin/medias"
          variant="contained"
          size="small"
          color="primary"
          classes={{ root: classes.buttonHome }}
        >
          <NewspaperVariantMultipleOutline
            className={classes.icon}
            fontSize="small"
          />
          {t('Medias')}
        </Button>
        <ArrowForwardIosOutlined
          color="primary"
          classes={{ root: classes.arrow }}
        />
        <Button
          component={Link}
          to={`/admin/medias/${mediaId}`}
          variant={
            location.pathname === `/admin/medias/${mediaId}`
              ? 'contained'
              : 'text'
          }
          size="small"
          color={
            location.pathname === `/admin/medias/${mediaId}`
              ? 'secondary'
              : 'primary'
          }
          classes={{ root: classes.button }}
        >
          {t('Overview')}
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
