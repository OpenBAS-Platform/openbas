import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import * as R from 'ramda';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import { withStyles } from '@material-ui/core/styles';
import { fetchComcheckStatus } from '../../../actions/Comcheck';
import { i18nRegister } from '../../../utils/Messages';
import { dateFormat } from '../../../utils/Time';
import { T } from '../../../components/I18n';

i18nRegister({
  fr: {
    'Communication check': 'Vérification de la communication',
    'Your communication check is': 'Votre test de comminication est',
    successfull: 'réussi',
    failed: 'échoué',
    'Verification done at': 'Vérification effectuée à',
  },
});

const comcheckHeight = 150;

const styles = () => ({
  container: {
    textAlign: 'center',
    margin: '0 auto',
    width: 400,
  },
  appBar: {
    borderTopLeftRadius: '10px',
    borderTopRightRadius: '10px',
    marginBottom: 15,
  },
  comcheck: {
    height: comcheckHeight,
    border: '1px solid #ddd',
    borderRadius: '10px',
    padding: '0 0 15px 0',
  },
  logo: {
    width: 150,
    margin: '0px 0px 20px 0px',
  },
  subtitle: {
    color: '#ffffff',
    fontWeight: 400,
    fontSize: 18,
  },
});

class IndexComcheck extends Component {
  componentDidMount() {
    this.props.fetchComcheckStatus(this.props.statusId);
  }

  render() {
    const { classes } = this.props;
    const statusState = R.propOr(0, 'status_state', this.props.comcheck_status);
    const statusLastUpdate = R.propOr(
      undefined,
      'status_last_update',
      this.props.comcheck_status,
    );
    const paddingTop = window.innerHeight / 2 - comcheckHeight / 2 - 180;
    return (
      <div className={classes.container} style={{ paddingTop }}>
        <img
          src="../../images/logo_openex.png"
          alt="logo"
          className={classes.logo}
        />
        <div className={classes.comcheck}>
          <AppBar
            color="primary"
            position="relative"
            className={classes.appBar}
          >
            <Toolbar>
              <div className={classes.subtitle}>
                {<T>Communication check</T>}
              </div>
            </Toolbar>
          </AppBar>
          <T>Your communication check is</T>
          <strong> {statusState ? <T>successfull</T> : <T>failed</T>}</strong>.
          <br />
          <br />
          {statusLastUpdate !== undefined && (
            <span>
              <T>Verification done at</T> {dateFormat(statusLastUpdate)}.
            </span>
          )}
        </div>
      </div>
    );
  }
}

IndexComcheck.propTypes = {
  statusId: PropTypes.string,
  comcheck_status: PropTypes.object,
  fetchComcheckStatus: PropTypes.func,
};

const select = (state, ownProps) => {
  const { statusId } = ownProps.match.params;
  const comcheckStatus = R.propOr(
    {},
    statusId,
    state.referential.entities.comchecks_statuses,
  );
  return {
    statusId,
    comcheck_status: comcheckStatus,
  };
};

export default R.compose(
  withRouter,
  connect(select, { fetchComcheckStatus }),
  withStyles(styles),
)(IndexComcheck);
